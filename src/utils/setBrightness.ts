import { exec } from 'child_process';
import { toggleDevice } from '../homeAutomation/tradfri.js';

let brightness = 1;
const setIt = (b1 = brightness, b2 = b1, b3 = b1) =>
  exec(
    `xrandr --output DisplayPort-0 --brightness ${b1} && xrandr --output DisplayPort-1 --brightness ${b2} && xrandr --output DisplayPort-2 --brightness ${b3}`,
  ).unref();

export function setBrightness(modifier = 1): () => void {
  return async () => {
    brightness = Math.max(1, Math.min(15, brightness + modifier));
    console.log({ brightness });
    setIt();
  };
}

let triState: 1 | 2 | 3;
export function videoBright() {
  triState = triState || 2;
  if (triState === 1) {
    setIt(brightness);
    triState = 2;
  } else if (triState === 2) {
    setIt(1, 0, 0);
    triState = 1;
  }
  // figure out a better way to set monitors to bright white.
  // else if (triState === 3) {
  //   setIt(1, 10, 10);
  //   triState = 1;
  // }
  console.log('nextSTate', triState);
}
