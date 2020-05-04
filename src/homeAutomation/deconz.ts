import {httpGetJson} from '../utils/httpGetJson';
import {getSettings, updateSettings} from './settings';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {Subject, timer, merge, of, EMPTY, Observable} from 'rxjs';
import {map, tap, filter, switchMap, shareReplay} from 'rxjs/operators';

import WebSocket from 'ws';
import {DeConfig, Aak, Whitelist, WsSmartEvent, Sensors, Sensor, State} from './deconz.interfaces';
import {turnOn, turnOff} from './tradfri';

const url = part => `http://localhost/api/${deconz.apiKey}/${part}`;
const {deconz} = getSettings();
const events$$ = new Subject<WsSmartEvent>();
const devices = new Map<string, Sensor>();

export const zigbeeEvents$ = events$$.pipe(
  filter(ev => devices.has(ev.uniqueid)),
  switchMap(
    (ev: WsSmartEvent): Observable<Sensor | undefined> => {
      // tslint:disable-next-line: no-non-null-assertion
      const device = devices.get(ev.uniqueid)!;
      if (ev.state) {
        device.state = {...device.state, ...ev.state};
        return of(device);
      }
      if (ev.config) {
        device.config = {...device.config, ...ev.config};
      }
      return of(undefined);
    }
  ),
  filter((d: any) => typeof d !== 'undefined'),
  tap((d: Sensor) => {
    console.log(d.name, d.state?.presence || d.state?.buttonevent);
  }),
  shareReplay(1)
);

const getConfig = async (): Promise<DeConfig> => {
  if (!deconz.apiKey) {
    await getApiKey();
  }
  return httpGetJson<DeConfig>(url('config'));
};

const appName = 'my application';
const getApiKey = async () => {
  const ba = `Basic ${Buffer.from(`admin:${deconz.password}`).toString('base64')}`;
  const result = await httpGetJson<Aak[]>('http://localhost/api', {
    method: 'post',
    headers: {Authorization: ba},
    data: {
      devicetype: appName,
    },
  }).catch(e => [] as Aak[]);
  const apiKey = result[0]?.success?.username;
  if (apiKey) {
    deconz.apiKey = apiKey;
    updateSettings({deconz});
    removeOthers(apiKey);
  }
  return apiKey;
};

const removeOthers = async apiKey => {
  const {whitelist} = await getConfig();
  [...Object.entries(whitelist)].forEach(async ([key, item]: [string, Whitelist]) => {
    if (key !== apiKey && item.name === appName) {
      const uri = url(`config/whitelist/${key}`);
      await httpGetJson(uri, {method: 'delete'});
    }
  });
};

const connect = async () => {
  const {websocketport} = await getConfig();
  const ws = new WebSocket(`ws://localhost:${websocketport}`);
  ws.onmessage = m => {
    const data = JSON.parse(m.data.toString());
    events$$.next(data as WsSmartEvent);
  };
  ws.onerror = e => console.error(e);
};

const init = async () => {
  connect();
  const sensors = await httpGetJson<Sensors[]>(url('sensors'));
  const lights = await httpGetJson<Sensors[]>(url('lights'));
  [...Object.entries(sensors), ...Object.entries(lights)].reduce(
    (m: Map<string, Sensor>, [id, sensor]: [string, any]) => {
      sensor._id = id;
      m.set(sensor.uniqueid, sensor);
      return m;
    },
    devices
  );
  // zigbeeEvents$.subscribe();
  console.table([...devices.values()]);
};

const isInit = init();

/** turn on at program start, and start listening to motion sensor */
merge(zigbeeEvents$, of({name: 'Buro motion sensor', state: {presence: true}} as Sensor))
  .pipe(
    /** only listen for 'motion detected, ignoring 'off' */
    filter(sensor => sensor.name === 'Buro motion sensor' && sensor.state?.presence === true),
    tap(async s => {
      console.log('turn on ' + new Date().toTimeString().slice(0, 8));
      /** turn on related light (monitors and desk lights) */
      await turnOn(1310798);
    }),
    /** start a timer, auto reset by above */
    switchMap(s => timer(15 * 60 * 1000)),
    tap(() => {
      console.log('turn off ' + new Date().toTimeString().slice(0, 8));
      turnOff(131079);
    })
  )
  .subscribe();


// turnOn(65579)

const testLamp = async (lamp = '90:fd:9f:ff:fe:29:9b:87-01') => {
  await isInit;
  const dev = devices.get(lamp);
  const state: State = {on: true, bri: 125};
  console.log(state);
  const r = await httpGetJson(url(`lights/${dev?._id}/state`), {method: 'put', data: state}).catch(e =>
    console.error(e)
  );
  console.log('r', r);
  return r;
};

testLamp();

zigbeeEvents$
  .pipe(
    filter(
      sensor =>
        sensor.name === 'TRÅDFRI remote control' &&
        sensor.state?.buttonevent !== undefined &&
        [3001, 3003].includes(sensor.state.buttonevent)
    ),
    map(sensor => sensor.state.buttonevent),
    switchMap(ev => (ev === 3001 ? timer(0, 250) : EMPTY)),
    tap(sensor => console.log(sensor))
  )
  .subscribe();
