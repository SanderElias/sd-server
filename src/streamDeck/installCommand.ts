import { Subject } from 'rxjs';
import { repeat, take, takeUntil, tap } from 'rxjs/operators';
// import { broadcast, listenFor, send } from '../server.js';
import { logWarn } from '../utils/log.js';
import { Command } from './Command.interface.js';
import { loadImage } from './loadImage.js';
import { click, deck$, resetDeckConnection } from './streamDeck.js';
import { broadcast, listenFor, send } from '../server/liveReload.js';

export const cmdList = new Map<string, Command>();
const flush = new Subject<void>();

export const resetDeck = async () => {
  cmdList.clear();
  flush.next();
  return deck$
    .pipe(
      take(1),
      tap((dck) => dck.clearAllKeys()),
    )
    .toPromise();
};

export function installCommand(cmd: Command) {
  try {
    const { tile, modifier, action } = cmd;
    const listen = modifier ? modifier(tile) : click(tile);
    const id = tile + (modifier || click).name;
    if (tile < 0 || tile > 14) {
      return;
    }
    listen
      .pipe(
        // tap(key => console.log('key', key, listen['name'])),
        repeat(),
        takeUntil(flush),
      )
      .subscribe({
        next: (delay: number) => {
          try {
            action();
            broadcast({ ...cmd, type: 'sdButton' });
          } catch (error) {
            console.error(error);
          }
        },
        complete: () => {
          // console.log(`${id} unloaded`);
        },
      });
    cmdList.set(id, { ...cmd, id });
    loadImage(cmd);
  } catch (e) {
    logWarn('could not setup command');
    console.error(e);
  }
}

function updateApp() {
  send({ type: 'cmdList', payload: [...cmdList.values()] });
}

listenFor('fetchList').subscribe({
  next: (msg) => {
    send({ client: msg.client, type: 'cmdList', payload: [...cmdList.values()] });
  },
});

listenFor('resetDeck').subscribe({
  next() {
    console.log('going to reset');
    resetDeckConnection();
  },
});
