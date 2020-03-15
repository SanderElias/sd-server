import {loadImage} from './loadImage';
import {streamDeck, click, dblClick, longClick} from './streamDeck';
import {tap, repeat} from 'rxjs/operators';
import {broadcast, events$, listenFor, send} from '../server';
import {Command} from './Command.interface';
import {logWarn} from '../utils/log';

export const cmdList = new Map<string, Command>();

export function installCommand(cmd: Command) {
  try {
    const {tile, modifier, action} = cmd;
    const listen = modifier ? modifier(tile) : click(tile);
    const id = tile +  (modifier || click).name;
    console.log(tile, id);
    listen
      .pipe(
        tap(key => console.log('key', key, listen['name'])),
        repeat()
      )
      .subscribe((delay: number) => {
        try {
          action();
          broadcast({...cmd, type: 'sdButton'});
        } catch (error) {
          console.error(error);
        }
      });
    cmdList.set(id, {...cmd, id});
    loadImage(cmd);
  } catch (e) {
    logWarn('could not setup command');
    console.error(e);
  }
}

listenFor('fetchList').subscribe({
  next: msg => {
    console.log('fetch from client');
    send({client: msg.client, type: 'cmdList', payload: [...cmdList.values()]});
  },
});
