
export interface Z2MDevices {
  definition: Definition | null;
  disabled: boolean;
  endpoints: { [key: string]: Endpoint; };
  friendly_name: string;
  ieee_address: string;
  interview_completed: boolean;
  interviewing: boolean;
  network_address: number;
  supported: boolean;
  type: Z2MDeviceType;
  date_code?: string;
  manufacturer?: Manufacturer;
  model_id?: string;
  power_source?: PowerSource;
  software_build_id?: string;
}

export interface Definition {
  description: string;
  exposes: Expose[];
  icon: string;
  model: string;
  options: Option[];
  supports_ota: boolean;
  vendor: Vendor;
}

export interface Expose {
  access?: number;
  description?: string;
  label?: string;
  name?: string;
  property?: string;
  type: ItemTypeType;
  value_off?: boolean;
  value_on?: boolean;
  category?: Category;
  unit?: string;
  value_max?: number;
  value_min?: number;
  features?: Feature[];
  values?: string[];
}

export enum Category {
  Config = 'config',
  Diagnostic = 'diagnostic'
}

export interface Feature {
  access: number;
  description: string;
  label: string;
  name: string;
  property: string;
  type: ItemTypeType;
  value_off?: boolean | string;
  value_on?: boolean | string;
  value_toggle?: string;
  value_max?: number;
  value_min?: number;
  presets?: Preset[];
  unit?: string;
  features?: ItemType[];
}

export interface ItemType {
  access: number;
  label: string;
  name: string;
  property?: string;
  type: ItemTypeType;
}

export enum ItemTypeType {
  Binary = 'binary',
  Composite = 'composite',
  Enum = 'enum',
  Light = 'light',
  Numeric = 'numeric',
  Switch = 'switch'
}

export interface Preset {
  description: string;
  name: string;
  value: number;
}

export interface Option {
  access: number;
  description: string;
  label: string;
  name: string;
  property: string;
  type: OptionType;
  value_max?: number;
  value_min?: number;
  value_off?: boolean;
  value_on?: boolean;
  item_type?: ItemType;
}

export enum OptionType {
  Binary = 'binary',
  List = 'list',
  Numeric = 'numeric'
}

export enum Vendor {
  Ikea = 'IKEA',
  TuYa = 'TuYa',
  Xiaomi = 'Xiaomi'
}

export interface Endpoint {
  bindings: Binding[];
  clusters: Clusters;
  configured_reportings: ConfiguredReporting[];
  scenes: any[];
}

export interface Binding {
  cluster: string;
  target: Target;
}

export interface Target {
  endpoint: number;
  ieee_address: IEEEAddress;
  type: TargetType;
}

export enum IEEEAddress {
  The0Xe0798Dfffebc6E5D = '0xe0798dfffebc6e5d'
}

export enum TargetType {
  Endpoint = 'endpoint'
}

export interface Clusters {
  input: string[];
  output: string[];
}

export interface ConfiguredReporting {
  attribute: Attribute;
  cluster: string;
  maximum_report_interval: number;
  minimum_report_interval: number;
  reportable_change: number;
}

export enum Attribute {
  BatteryPercentageRemaining = 'batteryPercentageRemaining',
  MeasuredValue = 'measuredValue',
  OnOff = 'onOff'
}

export enum Manufacturer {
  IKEAOfSweden = 'IKEA of Sweden',
  Lumi = 'LUMI',
  TZE204Ntcy3Xu1 = '_TZE204_ntcy3xu1'
}

export enum PowerSource {
  Battery = 'Battery',
  MainsSinglePhase = 'Mains (single phase)'
}

export enum Z2MDeviceType {
  Coordinator = 'Coordinator',
  EndDevice = 'EndDevice',
  Router = 'Router'
}export interface MqttMessage {
  topic: string;
  message: string;
}

