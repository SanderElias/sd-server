import {
  Accessory,
  AccessoryTypes,
  Group,
  TradfriClient,
  TradfriError,
  TradfriErrorCodes,
} from 'node-tradfri-client';
import { merge, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { dailyTimer } from '../scheduledTaks/simpleTimer.js';
import { logWarn } from '../utils/log.js';
import { getSettings, updateSettings } from './settings.js';

const settings = getSettings();
const inits = new Subject<void>();
const devices = new Map<number, Accessory | Group>();
const isInit = init();

export async function tradfriInit() {
  await isInit;

  testBuroAanUit();
}

async function init(tr = 0) {
  const { identity: tdId, psk, id } = await getIdPsk();
  const tradfri = new TradfriClient(id!, { watchConnection: true });
  try {
    await tradfri.connect(tdId!, psk!);
  } catch (e) {
    handleTradfriError(e as unknown as TradfriError);
  }
  devices.clear();
  await tradfri
    .on('device updated', tradfri_deviceUpdated)
    .on('device removed', tradfri_deviceRemoved)
    .observeDevices();
  await tradfri
    .on('group updated', tradfri_groupUpdated)
    .on('group removed', tradfri_deviceRemoved)
    .observeGroupsAndScenes();

  return true;
}

export async function groupToggle(deviceId: number) {
  await isInit;
  const device = devices.get(deviceId) as Group;
  if (device?.onOff) {
    device?.turnOff();
  } else {
    device?.turnOn();
  }
}

export async function buroToggle() {
  return await groupToggle(131079);
}

export async function isBuroAan() {
  await isInit;
  const buro = devices.get(131079) as Group;
  return buro?.onOff;
}

export async function toggleDevice(deviceId: number) {
  await isInit;
  // tslint:disable-next-line: no-non-null-assertion
  const device = (devices.get(deviceId) as Accessory)!.plugList[0];
  // console.log(device);
  if (device.onOff) {
    device.turnOff();
  } else {
    device.turnOn();
  }
}

const isGroup = (d: any): d is Group => typeof d === 'object' && d instanceof Group;

export async function turnOn(deviceId: number) {
  await isInit;
  const device = devices.get(deviceId);
  try {
    if (isGroup(device)) {
      // tslint:disable-next-line: no-unused-expression
      await device.turnOn();
    }
    if (device instanceof Accessory) {
      device.lightList?.forEach((l) => l.onOff === false && l.turnOn());
      device.plugList?.forEach((p) => p.onOff === false && p.turnOn());
    }
  } catch (e) {
    console.log(`error while turning ${device?.name} off`, e);
  }
}
export async function turnOff(deviceId: number) {
  await isInit;
  const device = devices.get(deviceId);
  try {
    if (isGroup(device)) {
      // tslint:disable-next-line: no-unused-expression
      await device.turnOff();
    }
    if (device instanceof Accessory) {
      device.lightList?.forEach((l) => l.onOff && l.turnOff());
      device.plugList?.forEach((p) => p.onOff && p.turnOff());
    }
  } catch (e) {
    console.log(`error while turning ${device?.name} off`, e);
  }
}

export async function testBuroAanUit() {
  await toggleDevice(65578);
}
export async function isTestBuroAan() {
  await isInit;
  // tslint:disable-next-line: no-non-null-assertion
  const testBuro = (devices.get(65578) as Accessory)!.plugList[0];
  // console.log(testBuro)
  return testBuro.onOff;
}

function tradfri_deviceUpdated(dev: Accessory) {
  // console.log('Dev', dev.name, dev.instanceId);
  // if (!devices.has(dev.instanceId)) {
  devices.set(dev.instanceId, dev);
  // }
}

function tradfri_deviceRemoved(id) {
  // console.log('remove', id);
  devices.delete(id);
}
function tradfri_groupUpdated(dev: Group) {
  // console.log('group', dev.name, dev.instanceId);
  // if (!devices.has(dev.instanceId)) {
  devices.set(dev.instanceId, dev);
  // }
}

let dc: NodeJS.Timeout;
export function discoff() {
  clearTimeout(dc);
}
export function disco1() {
  const devList = [65585, 65543];
  const flash = (n = -1) => {
    n += 1;
    if (n >= devList.length) {
      n = 0;
    }
    devList.forEach(async (d, i) => {
      try {
        const device = devices.get(d) as Accessory;
        const plug = device.plugList[0];
        if (i === n) {
          plug.turnOn();
        } else {
          plug.turnOff();
        }
      } catch (e) {}
    });
    dc = setTimeout(() => flash(n), 500);
  };
  flash();
}

export async function disco() {
  [...devices.values()].forEach((d) => {
    if (!(d instanceof Accessory) || d.type !== AccessoryTypes.motionSensor) {
      return;
    }
    // console.log(d.constructor.name, d.name, d.type);
  });
}

interface TradFriError {
  code: any;
}

function handleTradfriError(e: TradFriError) {
  if (e instanceof TradfriError) {
    switch (e.code) {
      case TradfriErrorCodes.ConnectionTimedOut: {
        console.error('The gateway is unreachable or did not respond in time');
      }
      // tslint:disable: no-switch-case-fall-through
      case TradfriErrorCodes.AuthenticationFailed: {
        console.log(`
         The security code is wrong or something else went wrong with the authentication.
         Check the error message for details. It might be that this library has to be updated
         to be compatible with a new firmware.
        `);
      }
      case TradfriErrorCodes.ConnectionFailed: {
        console.log(
          `
         An unknown error happened while trying to connect
        `,
          e,
        );
      }
    }
  }
}

async function getIdPsk() {
  try {
    // tslint:disable-next-line: no-shadowed-variable
    const { tradfri } = settings;
    if (!tradfri.psk) {
      const { identity, psk } = await getAuth(tradfri.id, tradfri.securityCode);
      tradfri.identity = identity!;
      tradfri.psk = psk!;
      updateSettings(settings);
      return { identity, psk, id: tradfri.id };
    }
    return { identity: tradfri.identity, psk: tradfri.psk, id: tradfri.id };
  } catch (e) {
    console.error(e);
  }
  return {};
}

async function getAuth(id: string, secret: string) {
  try {
    const tradfri = new TradfriClient(id);
    const { identity, psk } = await tradfri.authenticate(secret).catch();
    return { identity, psk };
  } catch (e) {
    logWarn(e);
    return {};
  }
}

merge(
  dailyTimer('18:30'),
  dailyTimer('20:00').pipe(filter(() => new Date().getDay() !== 2)),
  dailyTimer('21:15'),
).subscribe(async () => {
  await isInit;
  const buro = devices.get(131079) as Group;
  buro.turnOff();
});

merge(dailyTimer('21:00'), dailyTimer('21:45'), dailyTimer('22:30'), dailyTimer('23:30')).subscribe(
  async () => {
    await isInit;
    const showRoom = devices.get(131086) as Group;
    showRoom.turnOff();
  },
);
