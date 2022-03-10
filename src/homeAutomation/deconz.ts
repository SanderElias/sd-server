import { Observable, of, Subject, timer } from 'rxjs';
import { filter, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import WebSocket from 'ws';
import { broadcast } from '../server';
import { httpGetJson } from '../utils/httpGetJson';
import { logWarn } from '../utils/log';
import { runScript } from '../utils/runScript';
import { Aak, DeConfig, Sensor, Sensors, State, Whitelist, WsSmartEvent } from './deconz.interfaces';
import { pool } from './pg-client';
import { getSettings, updateSettings } from './settings';

const { deconz } = getSettings();
const url = (part) => `http://localhost:180/api/${deconz.apiKey}/${part}`;
const events$$ = new Subject<WsSmartEvent>();
const devices = new Map<string, Sensor>();
let logEvents = false;
export const zigbeeEvents$ = events$$.pipe(
  filter((ev) => devices.has(ev.uniqueid)),
  switchMap((ev: WsSmartEvent): Observable<Sensor | undefined> => {
    // tslint:disable-next-line: no-non-null-assertion
    const device = devices.get(ev.uniqueid)!;
    if (ev.state) {
      device.state = { ...device.state, ...ev.state };
      return of(device);
    }
    if (ev.config) {
      device.config = { ...device.config, ...ev.config };
    }
    return of(undefined);
  }),
  filter((d: any) => typeof d !== 'undefined'),
  tap((d: Sensor) => {
    const stateProps = Object.keys(d.state || {});
    if (logEvents && stateProps.findIndex((p) => 'buttonevent open presence'.split(' ').includes(p)) !== -1) {
      console.log(d.name, d.state);
    }
  }),
  shareReplay(1),
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
    headers: { Authorization: ba },
    data: {
      devicetype: appName,
    },
  }).catch((e) => [] as Aak[]);
  const apiKey = result[0]?.success?.username;
  if (apiKey) {
    deconz.apiKey = apiKey;
    updateSettings({ deconz });
    removeOthers(apiKey);
  }
  return apiKey;
};

const removeOthers = async (apiKey) => {
  const { whitelist } = await getConfig();
  [...Object.entries(whitelist)].forEach(async ([key, item]: [string, Whitelist]) => {
    if (key !== apiKey && item.name === appName) {
      const uri = url(`config/whitelist/${key}`);
      await httpGetJson(uri, { method: 'delete' });
    }
  });
};

const connect = async () => {
  const { websocketport } = await getConfig();
  const ws = new WebSocket(`ws://localhost:${websocketport}`);
  ws.onmessage = (m) => {
    const data = JSON.parse(m.data.toString());
    events$$.next(data as WsSmartEvent);
  };
  ws.onerror = (e) => console.error(e);
};

const init = async () => {
  connect();
  const sensors = await httpGetJson<Sensors[]>(url('sensors'));
  const lights = await httpGetJson<Sensors[]>(url('lights'));
  [...Object.entries(sensors), ...Object.entries(lights)].reduce(
    (m: Map<string, Sensor>, [id, sensor]: [string, any]) => {
      /** for now, filter out vnr e irtual phoscon devices */
      if (sensor.manufacturername !== 'Phoscon') {
        sensor._id = id;
        m.set(sensor.uniqueid, sensor);
      }
      return m;
    },
    devices,
  );
  // showTable();
};

const isInit = init();

export function getTable() {
  return [...devices.values()];
  // .map(row =>
  //   pluckFrom(row, '_id', 'name', 'type', 'modelid', 'manufacturername', 'swversion')
  // )
}

async function resetLamp() {
  await isInit;
  const d = 'ResetHelp';
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

async function dcSetState(d: string, state: State) {
  const dev = await dcGetState(d);
  if (dev === undefined) {
    logWarn(`device ${d} not found`);
    return;
  }
  const r = await httpGetJson(url(`lights/${dev?._id}/state`), { method: 'put', data: state }).catch((e) =>
    console.error(e),
  );
  // console.log('new device state', r);
}

async function dcGetState(d: string) {
  await isInit;
  const dev = devices.has(d) ? devices.get(d) : [...devices.values()].find((device) => device.name === d);
  if (dev === undefined) {
    logWarn(`device ${d} not found`);
    return;
  }
  // console.log('device', dev);
  return dev;
}

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
    tap(handleZigbeeEvents),
    // filter(
    //   (sensor) =>
    //     sensor.name === 'TRÅDFRI remote control' &&
    //     sensor.state?.buttonevent !== undefined &&
    //     [3001, 3003].includes(sensor.state.buttonevent)
    // ),
    // map((sensor) => sensor.state.buttonevent),
    // switchMap((ev) => (ev === 3001 ? timer(0, 250) : EMPTY))
  )
  .subscribe();

export interface ZigbeeAction {
  /** the given name or uniqueID of the sensor from the Psocon app */
  sensorName: string;
  /** type type of event, defaults to buttonPress */
  type?: keyof State;
  /** one of more events to act on */
  events: (number | ((param: any) => boolean))[];
  /** action to take, receives the Sensor, including the state  */
  action: (s: Sensor) => void;
  /** optional description to remember me what's the idea of this action ;) */
  description?: string;
}
function handleZigbeeEvents(sensor: Sensor) {
  zigbeeActions
    .filter((a) => a.sensorName === sensor.name || sensor.uniqueid === a.sensorName)
    .forEach(async (a) => {
      try {
        const prop = a.type || 'buttonevent';
        if (
          a.events.some((ev: any) =>
            typeof ev === 'function' ? ev(sensor.state[prop]) : ev === sensor.state[prop],
          )
        ) {
          await a.action(sensor);
        }
      } catch (e) {
        logWarn(a, e);
      }
    });
}

const zigbeeActions: ZigbeeAction[] = [
  {
    sensorName: 'Telfon',
    description: 'Start the Telfon VM',
    events: [1002],
    action: async (s) => {
      console.log('Start Telfon VM');
      await runScript('vmrun -t ws start "/home/sander/vmware/Windows 7 x64/Windows 7 x64.vmx"').catch(
        console.error,
      );
    },
  },
  {
    sensorName: 'Telfon',
    description: 'Start the Telfon VM',
    events: [2002],
    action: async (s) => {
      console.log('Stop Telfon VM');
      await runScript('vmrun -t ws stop "/home/sander/vmware/Windows 7 x64/Windows 7 x64.vmx"').catch(
        console.error,
      );
    },
  },
  {
    sensorName: 'BuroControl',
    description: 'Increase brightness of lampen @ buro',
    events: [2002],
    action: async (s) => {
      const curBright = (await dcGetState('BuroSanderLamp'))?.state.bri || 0;
      dcSetState('BuroSanderHanglamp', { bri: curBright + 25 });
      dcSetState('BuroSanderLamp', { bri: curBright + 25 });
    },
  },
  {
    sensorName: 'BuroControl',
    events: [3002],
    action: async (s) => {
      const curBright = (await dcGetState('BuroSanderLamp'))?.state.bri || 0;
      dcSetState('BuroSanderHanglamp', { bri: curBright - 25 });
      dcSetState('BuroSanderLamp', { bri: curBright - 25 });
    },
  },
  {
    sensorName: 'BuroControl',
    events: [4002],
    action: async (s) => {
      await dcSetState('BuroSanderHanglamp', { on: false });
      await dcSetState('BuroSanderLamp', { on: false });
      // await dcSetState('keukenHalOutlet', {on: false});
      await dcSetState('keukenHalOutletNew', { on: false });
      await dcSetState('KeukenLedLigth', { on: false });
      await dcSetState('showroomSwitch', { on: false });
    },
  },
  {
    sensorName: 'Smart Switch',
    events: [1004],
    action: () => {
      logEvents = !logEvents;
      console.log(`Logging deconz events turned ${logEvents ? 'on' : 'off'}`);
    },
  },
  {
    sensorName: 'showroomSwitch',
    events: [(t) => true],
    action: async (s) => {
      // tslint:disable-next-line: no-non-null-assertion
      const wait = (seconds) => new Promise((r) => setTimeout(r, seconds * 1000));
      const e = s.state.buttonevent!;
      const p = 'resetHelp';
      const {
        state: { on },
      } = (await dcGetState(p))!;
      switch (e) {
        case 1002:
          await dcSetState(p, { on: !on });
          break;
        case 1001:
          console.log('start reset');
          await dcSetState(p, { on: true });
          await wait(10);
          for (let x = 0; x < 6; x += 1) {
            console.log('cycle', x);
            await dcSetState(p, { on: false });
            await wait(1);
            await dcSetState(p, { on: true });
            await wait(1);
          }
          // await dcSetState(p, {on: true});

          break;
        default:
          break;
      }
      if (e === 1002) {
      }
    },
  },
  {
    sensorName: 'showroomSwitch',
    events: [2002],
    action: testRGBPulsate,
  },
  {
    sensorName: 'BuroTemprature',
    type: 'temperature',
    events: [(t) => true],
    action: async (sensor: Sensor) => {
      // it fires for every change, so we need to filter out the ones we don't want
      if (sensor.state.temperature === undefined) { return; }
      const temp = sensor.state.temperature;
      // console.dir(sensor.state);
      broadcast({ type: 'temprature', payload: sensor.state });
      pool
        .query('INSERT INTO tempratures (date,temp) VALUES ($1,$2)', [sensor.state.lastupdated, temp])
        .catch((e) => {
          console.log('error while writing to PG', e);
        });
      const heaterState = (await dcGetState('Heater'))?.state.on;
      const neededHeaterState = temp > 1700 ? false : temp < 1500 ? true : undefined;
      if (neededHeaterState !== undefined && heaterState !== neededHeaterState) {
        dcSetState('Heater', { on: neededHeaterState });
      }
      const time = `${new Date().getHours()}:${new Date().getMinutes()}`;
      console.log({ time, temp, neededHeaterState, heaterState });
    },
  },
];

async function testRGBPulsate() {

  console.log('going to try to pulsate')
  // const p = 'rgb';
  const p = 'BuroSignaal';
  const orgState =  ((await dcGetState(p))?.state || {} as State);
  console.dir(await dcGetState(p));
  const { on, bri, sat, xy } = orgState;
  const state = await dcGetState(p);
  const startState: State = {
    on: true,
    bri: 0,
    sat: 255,
    transitiontime: 0,
    xy: rgb_to_cie(255, 0, 0)
  }
  dcSetState(p, startState);
  await waitForState(p, { bri: 0 });
  let loop = 10
  while (--loop > 0) {
    dcSetState(p, { bri: 255, transitiontime: 50 })
    await wait(500)
    dcSetState(p, { bri: 0, transitiontime: 50 })
    await wait(500)
  }
  console.log('done pulsing up')
  await wait(1000)
  await dcSetState(p, { on, bri, sat, xy })

};



export async function addZigbeeAction(action: ZigbeeAction) {
  zigbeeActions.push(action);
}


// pulsateBulb('BuroSignaal');
// dcSetState('BuroSignaal', {transitiontime:20, sat:255 })
export async function pulsateBulb(lamp: string, direction: 'up' | 'down' = 'up', iter = 4) {
  const bulb = await dcGetState(lamp);
  if (!bulb) {
    return;
  }
  const initialState = bulb.state;
  // await dcSetState(lamp, { on: false, bri: 0 });
  // await wait(50)
  dcSetState(lamp, { on: true, bri: 1 });
  await waitForState(lamp, { bri: 1 });
  console.log('uit');
  for (let i = 0; i < iter; i += 1) {
    await dcSetState(lamp, { transitiontime: 5, bri: 254 });
    await waitForState(lamp, { bri: 254 });
    console.log('top');
    await dcSetState(lamp, { transitiontime: 5, bri: 1 });
    await waitForState(lamp, { bri: 1 });
    console.log('low');
  }
  await dcSetState(lamp, initialState);
}


function waitForState(name: Sensor['name'], state: Sensor['state']) {
  return timer(50, 50)
    .pipe(
      switchMap(() => dcGetState(name)),
      filter((s) => s !== undefined),
      tap((st) => console.log(st!.state?.bri)),
      filter((e) => Object.entries(state).every(([k, v]) => e!.state[k] === v)),
      take(1),
    )
    .toPromise();
}

function wait(n: number) {
  return new Promise((r) => setTimeout(r, n));
}
