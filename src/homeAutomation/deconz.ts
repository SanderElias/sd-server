import {EMPTY, Observable, of, Subject, timer} from 'rxjs';
import {filter, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import WebSocket from 'ws';
import {httpGetJson} from '../utils/httpGetJson';
import {logWarn} from '../utils/log';
import {Aak, DeConfig, Sensor, Sensors, State, Whitelist, WsSmartEvent} from './deconz.interfaces';
import {getSettings, updateSettings} from './settings';

const url = part => `http://localhost/api/${deconz.apiKey}/${part}`;
const {deconz} = getSettings();
const events$$ = new Subject<WsSmartEvent>();
const devices = new Map<string, Sensor>();
let logEvents = false;
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
    if (d.name === 'Smart Switch' && d.state?.buttonevent === 1004) {
      logEvents = !logEvents;
      console.log(`Logging deconz events turned ${logEvents ? 'on' : 'off'}`);
    }
    if (logEvents) {
      console.log(d.name, d.state?.presence || d.state?.buttonevent);
    }
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
  console.table([...devices.values()]);
};

const isInit = init();

async function resetLamp() {
  await isInit;
  const d = 'ResetLightHelp';
  // const outlet = devices.get('cc:cc:cc:ff:fe:ae:9f:d1-01') as Sensor;
  // zigbeeEvents$
  //   .pipe(
  //     filter(sensor => sensor.name === 'ResetLightHelp'),
  //     tap(sensor => console.log('outlet', sensor)),
  //     // switchMap(ev => (ev === 3001 ? timer(0, 250) : EMPTY)),
  //     tap(sensor => console.log(sensor))
  //   )
  //   .subscribe();

  // console.log(outlet);

  // await dcSetState(d, {bri: 255});
  // await dcSetState(d, {on: false});
  // await new Promise(r => setTimeout(r, 1000));
  // await dcSetState(d, {on: true});
  // await new Promise(r => setTimeout(r, 2500));
  // const t = 950;
  // for (let i = 0; i < 8; i += 1) {
  //   await dcSetState(d, {on: false});
  //   await new Promise(r => setTimeout(r, t));
  //   await dcSetState(d, {on: true});
  //   await new Promise(r => setTimeout(r, t / 1.5));
  // }
}

resetLamp();

const onState = true;

/** turn on at program start, and start listening to motion sensor */
// merge(zigbeeEvents$, of({name: 'Buro motion sensor', state: {presence: true}} as Sensor))
//   .pipe(
//     /** only listen for 'motion detected, ignoring 'off' */
//     filter(sensor => sensor.name === 'Buro motion sensor' && sensor.state?.presence === true),
//     tap(async s => {
//       console.log('turn on ' + new Date().toTimeString().slice(0, 8));
//       if (!onState) {
//         /** turn on related light (monitors and desk lights) */
//         await turnOn(131079);
//         await new Promise((r) => setTimeout(r,3000))
//         await i3Command('restart');
//         await resetDeckConnection();
//         onState = true;
//       }
//     }),
//     /** start a timer, auto reset by above */
//     switchMap(s => timer(15 * 60 * 1000)),
//     tap(async () => {
//       console.log('turn off ' + new Date().toTimeString().slice(0, 8));
//       await turnOff(131079);
//       onState = false;
//     })
//   )
//   .subscribe();

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

async function dcSetState(d: string, state: State) {
  const dev = await dcGetState(d);
  if (dev === undefined) {
    logWarn(`device ${d} not found`);
    return;
  }
  const r = await httpGetJson(url(`lights/${dev?._id}/state`), {method: 'put', data: state}).catch(e =>
    console.error(e)
  );
  // console.log('new device state', r);
}

async function dcGetState(d: string) {
  const dev = devices.has(d) ? devices.get(d) : [...devices.values()].find(dev => dev.name === d);
  if (dev === undefined) {
    logWarn(`device ${d} not found`);
    return;
  }
  // console.log('device', dev);
  return dev;
}

setTimeout(async () => {
  const p = 9990;
  const step = 250;
  let factor = 1;
  let factory = -1;
  let x = 100;
  let y = p;
  const maxed = n => {
    n += factor * step;
    if (n > p) {
      n = p;
      factor = -1;
    }
    if (n < 100) {
      n = 100;
      factor = 1;
    }
    return n;
  };
  const maxedy = n => {
    n += factory * step;
    if (n > p) {
      n = p;
      factory = -1;
    }
    if (n < 100) {
      n = 100;
      factory = 1;
    }
    return n;
  };
  const newState = {on: true, transitiontime: 1, bri: 48, sat: 0} as State;
  while (true) {
    x = maxed(x);
    y = x < 101 ? maxedy(y) : y;
    newState.xy = [x / p, y / p];
    // console.log(x, y, newState.xy);
    await dcSetState('rgb', newState);
    await new Promise(r => setTimeout(r, 500));
  }
}, 2000);


/**
 * https://github.com/usolved/cie-rgb-converter/blob/master/cie_rgb_converter.js
 * Converts RGB color space to CIE color space
 * @param {Number} red
 * @param {Number} green
 * @param {Number} blue
 * @return {Array} Array that contains the CIE color values for x and y
 */
function rgb_to_cie(red = 0, green = 0, blue = 0): [number, number] {
  // Apply a gamma correction to the RGB values, which makes the color more vivid and more the like the color displayed on the screen of your device
  red = red > 0.04045 ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : red / 12.92;
  green = green > 0.04045 ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : green / 12.92;
  blue = blue > 0.04045 ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : blue / 12.92;

  // RGB values to XYZ using the Wide RGB D65 conversion formula
  const X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  const Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
  const Z = red * 0.000088 + green * 0.07231 + blue * 0.986039;

  // Calculate the xy values from the XYZ values
  let x = +(X / (X + Y + Z)).toFixed(4);
  let y = +(Y / (X + Y + Z)).toFixed(4);

  if (isNaN(x)) {
    x = 0;
  }

  if (isNaN(y)) {
    y = 0;
  }

  return [x, y];
}

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
