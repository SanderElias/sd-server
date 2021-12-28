import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {decode, encode} from 'src/utils/cbor';
import {WsMessage} from 'src/server/WsMessage';

interface WSocketHandlers {
  type: string;
  action: (payload?, type?) => void;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private wSocket: WebSocket;
  private tries = 0;
  private handlers: WSocketHandlers[] = [];
  private events = new Subject<WsMessage>();
  events$ = this.events.asObservable();
  listenFor = (type: string) => this.events$.pipe(filter(ev => ev.type === type));

  addHandler = (type: string, action: (payload?: any, type?: string) => void) =>
    this.handlers.push({type, action});

  constructor() {
    this.hookUp();
    this.addHandler('reload', () => document.location.reload());
  }

  send(msg: WsMessage) {
    if (this.wSocket) {
      this.wSocket.send(encode(msg));
    }
  }

  /** crude, blindly retry on anything websocket connection. */
  private hookUp() {
    try {
      this.wSocket = new WebSocket('ws://localhost:3001');
      // console.log('websocket connected', this.wSocket.readyState);
      this.wSocket.binaryType = 'arraybuffer';

      /** send hello */
      this.wSocket.addEventListener('open', () => {
        try {
          this.wSocket.send(encode('hello'));
          /** successful, reset retry count. */
          this.tries = 0;
        } catch (e) {
          console.error(e);
        }
      });

      /** enable automated reload */
      this.wSocket.addEventListener('message', evt => {
        if (evt) {
          try {
            const data = decode(evt.data) as WsMessage;
            this.events.next(data);
            const actions = this.handlers.filter(h => h.type === data.type);
            actions.forEach(action => action.action(data.payload, data.type));
          } catch (e) {
            console.error(e);
          }
        }
      });

      /** reattach on close */
      this.wSocket.addEventListener('close', () => {
        this.reConnect();
      });

      /** reattach on error */
      this.wSocket.addEventListener('error', e => {
        try {
          this.wSocket.close();
        } catch (e) {}
        this.reConnect();
      });
    } catch (e) {
      this.reConnect();
    }
  }

  reConnect() {
    this.wSocket = undefined;
    if (++this.tries < 100) {
      setTimeout(() => this.hookUp(), 750);
    }
  }
}
