import {readFileSync, writeFileSync} from 'fs';
import {
  Accessory,
  Group,
  TradfriClient,
  TradfriError,
  TradfriErrorCodes,
  GatewayDetails,
} from 'node-tradfri-client';
import {join} from 'path';
import {bufferToggle, shareReplay} from 'rxjs/operators';
import {Subject} from 'rxjs';

const settingsFile = join(__dirname, '../../../serials.json');
const settings = JSON.parse(readFileSync(settingsFile).toString('utf8'));

const inits = new Subject<void>();
const devices = new Map<number, Accessory | Group>();
const isInit = init();
export async function tradfriInit() {
  await isInit;

  testBuroAanUit();
}

async function init(tr = 0) {
  const {identity: tdId, psk, id} = await getIdPsk();
  const tradfri = new TradfriClient(id, {watchConnection: true});
  try {
    await tradfri.connect(tdId, psk);
  } catch (e) {
    handleTradfriError(e);
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
  console.log({buro});
  return buro?.onOff;
}

export async function toggleDevice(deviceId: number) {
  await isInit;
  // tslint:disable-next-line: no-non-null-assertion
  const device = (devices.get(deviceId) as Accessory)!.plugList[0];
  if (device.onOff) {
    device.turnOff();
  } else {
    device.turnOn();
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
  console.log('Dev', dev.name, dev.instanceId);
  // if (!devices.has(dev.instanceId)) {
  devices.set(dev.instanceId, dev);
  // }
}

function tradfri_deviceRemoved(id) {
  console.log('remove', id);
  devices.delete(id);
}
function tradfri_groupUpdated(dev: Group) {
  console.log('group', dev.name, dev.instanceId);
  // if (!devices.has(dev.instanceId)) {
  devices.set(dev.instanceId, dev);
  // }
}

let dc: NodeJS.Timeout;
export function discoff() {
  clearTimeout(dc);
}
export function disco() {
  const shg = devices.get(131086) as Group;
  console.log(shg.deviceIDs);
  // const devList = [...devices.values()]
  //   .filter(d => d?.name?.toLowerCase().includes('show') && d instanceof Accessory)
  //   .map(d => d?.instanceId);
  const devList = [65585, 65543]; //shg.deviceIDs.filter(id => id !== shg.instanceId);
  console.log(devList);

  devList.forEach(d => console.log(devices.get(d)?.name));
  const fl = (n = -1) => {
    n += 1;
    if (n >= devList.length) {
      n = 0;
    }
    devList.forEach(async (d, i) => {
      console.log({n, i});
      try {
        const device = devices.get(d) as Accessory;
        const plug = device?.plugList[0];
        // console.log(device.name);
        if (!plug) {
          return;
        }
        if (i === n) {
          plug.turnOn();
        } else {
          plug.turnOff();
        }
      } catch (e) {
        // console.log('err', e);
      }
    });
    dc = setTimeout(() => fl(n), 500);
  };
  fl();
}

function handleTradfriError(e: {code: any}) {
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
          e
        );
      }
    }
  }
}

async function getIdPsk() {
  try {
    // tslint:disable-next-line: no-shadowed-variable
    const {tradfri} = settings;
    if (!tradfri.psk) {
      const {identity, psk} = await getAuth(tradfri.id, tradfri.securityCode);
      tradfri.identity = identity;
      tradfri.psk = psk;
      writeFileSync(settingsFile, JSON.stringify(settings));
      return {identity, psk, id: tradfri.id};
    }
    return {identity: tradfri.identity, psk: tradfri.psk, id: tradfri.id};
  } catch (e) {
    console.error(e);
  }
  return {};
}

async function getAuth(id: string, secret: string) {
  try {
    const tradfri = new TradfriClient(id);
    const {identity, psk} = await tradfri.authenticate(secret).catch();
    return {identity, psk};
  } catch (e) {
    return {};
  }
}
