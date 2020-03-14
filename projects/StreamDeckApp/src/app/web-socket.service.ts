import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private wSocket: WebSocket;
  tries = 0;

  constructor() {
    this.hookUp();
  }

  hookUp() {
    try {
      this.wSocket = new WebSocket('ws://localhost:3001');

      /** send hello */
      this.wSocket.addEventListener('open', () => {
        try {
          this.wSocket.send('hello');
        } catch (e) {}
      });

      /** enable automated reload */
      this.wSocket.addEventListener('message', evt => {
        if (evt && evt.data === 'reload') {
          console.log('Reload command received');
          document.location.reload();
        }
      });

      /** reattach on close */
      this.wSocket.addEventListener('close', () => {
        this.wSocket = undefined;
        if (++this.tries < 15) {
          setTimeout(() => this.hookUp(), 750);
        }
      });

      /** reattach on error */
      this.wSocket.addEventListener('error', e => {
        try {
          this.wSocket.close();
        } catch (e) {}
        this.wSocket = undefined;
        if (++this.tries < 15) {
          setTimeout(() => this.hookUp(), 750);
        }
      });
    } catch (e) {
      setTimeout(() => this.hookUp(), 750);
    }
  }
}
