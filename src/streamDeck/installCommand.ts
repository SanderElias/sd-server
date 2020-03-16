import {repeat, tap} from 'rxjs/operators';
import {broadcast, listenFor, send} from '../server';
import {logWarn} from '../utils/log';
import {Command} from './Command.interface';
import {loadImage} from './loadImage';
import {click} from './streamDeck';

export const cmdList = new Map<string, Command>();

export function installCommand(cmd: Command) {
  try {
    const {tile, modifier, action} = cmd;
    const listen = modifier ? modifier(tile) : click(tile);
    const id = tile + (modifier || click).name;
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
