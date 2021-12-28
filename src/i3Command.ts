import { i3 } from './utils/i3';
export function i3Command(arg) {
  return new Promise((resolve, reject) => {
    i3.command(arg, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}
interface Outputs {
  left: string;
  middle: string;
  right: string;
  rest: string[];
}

export function i3Outputs(): Promise<Outputs> {
  return new Promise((resolve, reject) => {
    i3.outputs((err, d) => {
      if (err) {
        console.log('i3Outputs error', err);
        return reject(err);
      }
      try {
        const displays = d
          /** get the active ones */
          .filter((r) => r.active)
          /** sort on left to right order */
          .sort((x, y) => (x.rect.x < y.rect.x ? -1 : 1))
          /** extract only the names */
          .map((r) => {
            return r.name;
          });
        const [left, middle, right, ...rest] = displays;
        resolve({ left, middle, right, rest });
      } catch (e) {
        console.log('i3Outputs catch error', e);
        return reject(e);
      }
    });
  });
}
export interface WorkSpace {
  num: number;
  name: string;
  visible: boolean;
  focused: boolean;
  rect: Rect;
  output: string;
  urgent: boolean;
}
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export function i3WorksSpaces(): Promise<WorkSpace[]> {
  return new Promise((resolve, reject) => {
    i3.workspaces((err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}
export function i3Tree(): Promise<I3Tree> {
  return new Promise((resolve, reject) => {
    i3.tree((err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

export async function moveWP(num: number, mon: keyof Outputs) {
  const display = (await i3Outputs())[mon];
  await i3Command(`workspace number ${num}`);
  return await i3Command(`move workspace to output "${display}"`);
}

export interface I3Tree {
  id: number;
  type: string;
  orientation: Border;
  scratchpad_state: Border;
  percent: number;
  urgent: boolean;
  focused: boolean;
  layout: string;
  workspace_layout: WorkspaceLayout;
  last_split_layout: Layout;
  border: Border;
  current_border_width: number;
  rect: DecoRect;
  deco_rect: DecoRect;
  window_rect: DecoRect;
  geometry: DecoRect;
  name: Name;
  window: null;
  nodes: I3TreeNode[];
  floating_nodes: any[];
  focus: number[];
  fullscreen_mode: number;
  sticky: boolean;
  floating: Floating;
  swallows: any[];
}

export enum Border {
  None = 'none',
  Pixel = 'pixel',
}

export interface DecoRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum Floating {
  AutoOff = 'auto_off',
}

export enum Layout {
  Splith = 'splith',
  Splitv = 'splitv',
}

export enum Name {
  DisplayPort0 = 'DisplayPort-0',
  DisplayPort1 = 'DisplayPort-1',
  DisplayPort2 = 'DisplayPort-2',
}

export interface I3TreeNode {
  id: number;
  type: string;
  orientation: Orientation;
  scratchpad_state: Border;
  percent: null;
  urgent: boolean;
  focused: boolean;
  output: Name;
  layout: string;
  workspace_layout: WorkspaceLayout;
  last_split_layout: Layout;
  border: Border;
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
  floating: Floating;
  swallows: Swallow[];
}

export interface PurpleNode {
  id: number;
  type: Type;
  orientation: Orientation;
  scratchpad_state: Border;
  percent: number;
  urgent: boolean;
  focused: boolean;
  output: Name;
  layout: Layout;
  workspace_layout: WorkspaceLayout;
  last_split_layout: Layout;
  border: Border;
  current_border_width: number;
  rect: DecoRect;
  deco_rect: DecoRect;
  window_rect: DecoRect;
  geometry: DecoRect;
  name: string;
  num?: number;
  gaps?: Gaps;
  window: number | null;
  nodes: FluffyNode[];
  floating_nodes: any[];
  focus: number[];
  fullscreen_mode: number;
  sticky: boolean;
  floating: Floating;
  swallows: any[];
  window_properties?: WindowProperties;
}

export interface Gaps {
  inner: number;
  outer: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface FluffyNode {
  id: number;
  type: Type;
  orientation: Orientation;
  scratchpad_state: Border;
  percent: number;
  urgent: boolean;
  focused: boolean;
  output: Name;
  layout: Layout;
  workspace_layout: WorkspaceLayout;
  last_split_layout: Layout;
  border: Border;
  current_border_width: number;
  rect: DecoRect;
  deco_rect: DecoRect;
  window_rect: DecoRect;
  geometry: DecoRect;
  name: null | string;
  window: number | null;
  window_properties?: WindowProperties;
  nodes: FluffyNode[];
  floating_nodes: any[];
  focus: number[];
  fullscreen_mode: number;
  sticky: boolean;
  floating: Floating;
  swallows: any[];
}

export enum Orientation {
  Horizontal = 'horizontal',
  None = 'none',
  Vertical = 'vertical',
}

export enum Type {
  Con = 'con',
  Workspace = 'workspace',
}

export interface WindowProperties {
  class: string;
  instance: string;
  title: string;
  transient_for: null;
  window_role?: string;
}

export enum WorkspaceLayout {
  Default = 'default',
}

export interface Swallow {
  dock: number;
  insert_where: number;
}
