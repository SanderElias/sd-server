// Generated by https://quicktype.io


export interface Aak {
  success: Success;
}
export interface Success {
  username: string;
}

export interface DeConfig {
  UTC: string;
  apiversion: string;
  backup: Backup;
  bridgeid: string;
  datastoreversion: string;
  devicename: string;
  dhcp: boolean;
  factorynew: boolean;
  fwversion: string;
  gateway: string;
  internetservices: Internetservices;
  ipaddress: string;
  linkbutton: boolean;
  localtime: string;
  mac: string;
  modelid: string;
  name: string;
  netmask: string;
  networkopenduration: number;
  panid: number;
  portalconnection: string;
  portalservices: boolean;
  portalstate: Portalstate;
  proxyaddress: string;
  proxyport: number;
  replacesbridgeid: null;
  rfconnected: boolean;
  starterkitid: string;
  swupdate: Swupdate;
  swupdate2: Swupdate2;
  swversion: string;
  timeformat: string;
  timezone: null;
  uuid: string;
  websocketnotifyall: boolean;
  websocketport: number;
  whitelist: {
    [key: string]: Whitelist;
  };
  zigbeechannel: number;
}
export interface Backup {
  errorcode: number;
  status: string;
}
export interface Internetservices {
  remoteaccess: string;
}
export interface Portalstate {
  communication: string;
  incoming: boolean;
  outgoing: boolean;
  signedon: boolean;
}
export interface Swupdate {
  checkforupdate: boolean;
  devicetypes: Devicetypes;
  notify: boolean;
  text: string;
  updatestate: number;
  url: string;
}
export interface Devicetypes {
  bridge: boolean;
  lights: any[];
  sensors: any[];
}
export interface Swupdate2 {
  autoinstall: Autoinstall;
  bridge: Bridge;
  checkforupdate: boolean;
  install: boolean;
  lastchange: string;
  lastinstall: string;
  state: string;
}
export interface Autoinstall {
  on: boolean;
  updatetime: string;
}
export interface Bridge {
  lastinstall: string;
  state: string;
}
export interface Whitelist {
  'create date': string;
  'last use date': string;
  name: Name;
}
export enum Name {
  MyApplication = 'my application',
  PhosconB2560X905 = 'Phoscon#B2560x905',
}
// Generated by https://quicktype.io
export interface WsSmartEvent {
  e: EventType;
  id: string;
  r: ResourceType;
  state?: State;
  t: MsgType;
  uniqueid: string;
  config?: Config;
}

export enum EventType {
  Changed = 'changed',
  Added = 'added',
  Deleted = 'deleted',
  SceneCalled = 'scene-called',
}
export enum ResourceType {
  Sensors = 'sensors',
  Groups = 'groups',
  Lights = 'lights',
  Scenes = 'scenes',
}

export enum MsgType {
  Event = 'event',
}

export interface Sensors {
  [id: string]: Sensor;
}

export interface Sensor {
  _id: string;
  config?: Config;
  etag?: string;
  manufacturername: string;
  modelid: string;
  name: string;
  state: State;
  swversion?: string;
  type: string;
  uniqueid: string;
  ep?: number;
  mode?: number;
  hascolor?: boolean;
}

export interface Config {
  configured?: boolean;
  on: boolean;
  sunriseoffset?: number;
  sunsetoffset?: number;
  alert?: string;
  battery?: number;
  delay?: number;
  duration?: number;
  group?: string;
  reachable?: boolean;
}

export interface State {
  dark?: boolean;
  daylight?: null;
  lastupdated?: string;
  status?: number;
  presence?: boolean;
  buttonevent?: number;
  reachable?: boolean;
  alert?: string;
  bri?: number;
  on?: boolean;
}
