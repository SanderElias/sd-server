import {loadImage} from './loadImage';
import { streamDeck, click } from './streamDeck';
import { Observable } from 'rxjs';
import { tap, repeat } from 'rxjs/operators';

export interface Command {
  tile: number;
  modifier?: (number) => Observable<number> 
  title?: string;
  image: string;
  action: () => void;
}

export const cmdList = new Map<number, Command>();

export function installCommand(cmd: Command) {
  const {tile, modifier,action} = cmd;
  const listen = modifier ? modifier(tile) : click(tile)
  listen.pipe(tap(key => console.log('key', key,listen)),repeat()).subscribe(action)
  cmdList.set(tile, cmd);
  loadImage(cmd);
}

