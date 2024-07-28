import { Sensor } from './deconz.interfaces.js';
import { dcGetState, dcSetState } from './deconz.js';

export async function dimRelative(name: Sensor['name'], n: number) {
  n = n * (255 / 100);
  let {
    state: { bri, on },
  } = (await dcGetState(name)) ?? { state: {} };
  bri ??= 0;
  bri = Math.max(0, Math.min(255, bri + n));
  if (bri === 0) {
    return dcSetState(name, { on: false });
  }
  if (bri !== undefined) await dcSetState(name, { on: true, bri });
}
