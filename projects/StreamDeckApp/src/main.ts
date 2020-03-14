import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

if (environment.production) {
  enableProdMode();
}

let wSocket;
let tries = 0;
const connect = () => {
  try {
    wSocket = new WebSocket('ws://localhost:3001');
    wSocket.addEventListener('open', () => {
      try {
        wSocket.send('hello');
      } catch (e) {}
    });

    wSocket.addEventListener('message', evt => {
      if (evt && evt.data === 'reload') {
        console.log('Reload command received');
        document.location.reload();
      }
    });

    wSocket.addEventListener('close', () => {
      wSocket = undefined;
      if (++tries < 15) {
        setTimeout(connect, 1500);
      }
    });

    wSocket.addEventListener('error', e => {
      try {
        wSocket.close();
      } catch (e) {}
      wSocket = undefined;
      if (++tries < 15) {
        setTimeout(connect, 1500);
      }
    });
  } catch (e) {
    setTimeout(connect, 1500);
  }
};
connect();

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));


