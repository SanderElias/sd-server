import { dcSetState } from './deconz.js';

export async function resetHelper() {
  const wait = (seconds) => new Promise((r) => setTimeout(r, seconds * 1000));
  const p = 'resetHelp';
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
}
