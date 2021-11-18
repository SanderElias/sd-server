
import { distinctUntilChanged, filter, map, repeat, tap } from 'rxjs/operators';
import { disco, discoff } from './homeAutomation/tradfri';
import { Command } from './streamDeck/Command.interface';
import { loadImage } from './streamDeck/loadImage';
import { longPress } from './streamDeck/streamDeck';
import { commands } from './streamdeckPages/page-1';
import { page3 } from './streamdeckPages/page-3';
import { activateNextPage, activatePage } from './utils/activePage';

export const pages = [commands, page3];

activatePage(1);

export function getTile(page: Command[], num: any) {
  return page.find((r) => r.tile === num);
}

async function bulb(tile, prom) {
  const t = getTile(page3, tile)!;
  if (await prom) {
    t.image = 'bulbOn.png';
  } else {
    t.image = 'bulbOff.png';
  }
  loadImage(t);
}

const cyclePages = () => {
  longPress(14)
    .pipe(
      map((r) => Math.floor(r.delay / 1500)),
      distinctUntilChanged(),
      filter(Boolean),
      tap((k) => activateNextPage()),
      repeat()
    )
    .subscribe({
      next: (p) => {},
    });
};

cyclePages();

let x = true;
export function toctick() {
  if (x) {
    disco();
  } else {
    discoff();
  }
  bulb(8, x);
  x = !x;
}

// 06 53 79 61 46, bastansen
const lamp = '90:fd:9f:ff:fe:29:9b:87-01';
