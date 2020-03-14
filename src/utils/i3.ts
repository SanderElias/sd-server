// import * as i3 from 'node-i3';
export const i3 = require('i3').createClient();



export interface TentacledNode {
  id: number;
  type: string;
  orientation: string;
  scratchpad_state: string;
  percent: number;
  urgent: boolean;
  focused: boolean;
  output: string;
  layout: string;
  workspace_layout: string;
  last_split_layout: string;
  border: string;
  current_border_width: number;
  rect: DecoRect;
  deco_rect: DecoRect;
  window_rect: DecoRect;
  geometry: DecoRect;
  name: null | string;
  window: number | null;
  window_properties?: WindowProperties;
  nodes: I3Tree[];
  floating_nodes: any[];
  focus: number[];
  fullscreen_mode: number;
  sticky: boolean;
  floating: string;
  swallows: any[];
}

export interface FluffyNode {
  id: number;
  type: string;
  orientation: string;
  scratchpad_state: string;
  percent: number | null;
  urgent: boolean;
  focused: boolean;
  output: string;
  layout: string;
  workspace_layout: string;
  last_split_layout: string;
  border: string;
  current_border_width: number;
  rect: DecoRect;
  deco_rect: DecoRect;
  window_rect: DecoRect;
  geometry: DecoRect;
  name: string;
  num?: number;
  gaps?: Gaps;
  window: number | null;
  nodes: TentacledNode[];
  floating_nodes: any[];
  focus: number[];
  fullscreen_mode: number;
  sticky: boolean;
  floating: string;
  swallows: any[];
  window_properties?: WindowProperties;
}

export interface PurpleNode {
  id: number;
  type: string;
  orientation: string;
  scratchpad_state: string;
  percent: null;
  urgent: boolean;
  focused: boolean;
  output: string;
  layout: string;
  workspace_layout: string;
  last_split_layout: string;
  border: string;
  current_border_width: number;
  rect: DecoRect;
  deco_rect: DecoRect;
  window_rect: DecoRect;
  geometry: DecoRect;
  name: string;
  window: null;
  nodes: FluffyNode[];
  floating_nodes: any[];
  focus: number[];
  fullscreen_mode: number;
  sticky: boolean;
  floating: string;
  swallows: Swallow[];
}

export interface I3TreeNode {
  id: number;
  type: string;
  orientation: string;
  scratchpad_state: string;
  percent: number;
  urgent: boolean;
  focused: boolean;
  layout: string;
  workspace_layout: string;
  last_split_layout: string;
  border: string;
  current_border_width: number;
  rect: DecoRect;
  deco_rect: DecoRect;
  window_rect: DecoRect;
  geometry: DecoRect;
  name: string;
  window: null;
  nodes: PurpleNode[];
  floating_nodes: any[];
  focus: number[];
  fullscreen_mode: number;
  sticky: boolean;
  floating: string;
  swallows: any[];
}

export interface I3Tree {
  id: number;
  type: string;
  orientation: string;
  scratchpad_state: string;
  percent: number | null;
  urgent: boolean;
  focused: boolean;
  layout: string;
  workspace_layout: string;
  last_split_layout: string;
  border: string;
  current_border_width: number;
  rect: DecoRect;
  deco_rect: DecoRect;
  window_rect: DecoRect;
  geometry: DecoRect;
  name: string;
  window: number | null;
  nodes: I3TreeNode[];
  floating_nodes: any[];
  focus: number[];
  fullscreen_mode: number;
  sticky: boolean;
  floating: string;
  swallows: any[];
  output?: string;
  window_properties?: WindowProperties;
}

export interface DecoRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowProperties {
  class: string;
  instance: string;
  window_role?: string;
  title: string;
  transient_for: null;
}

export interface Gaps {
  inner: number;
  outer: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Swallow {
  dock: number;
  insert_where: number;
}
