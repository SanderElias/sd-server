import {loadImage} from './loadImage';
import { streamDeck, click } from './streamDeck';
import { Observable } from 'rxjs';

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
  listen.subscribe(action)
  cmdList.set(tile, cmd);
  loadImage(cmd);
}

