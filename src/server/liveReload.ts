import {Server} from 'ws';
import {log, logError, yellow} from '../utils/log';
import {settings} from './settings';

let wss;
async function enableLiveReloadServer() {
  try {
    log('enable reload on port', settings.reloadPort);
    // tslint:disable-next-line:only-arrow-functions
    wss = new Server({port: settings.reloadPort, noServer: true});
    wss.on('connection', client => {
      client.on('message', message => {
        // console.log(`Received message => ${message}`);
      });
      client.send('Hello! Message From Server!!');
    });
  } catch (e) {
    logError(`
-----------------------------------
The port "${yellow(settings.reloadPort)}" is not available for the live-reload server.
live reload will not be available. You can configure a different port in the config file.
-----------------------------------`);
    wss = undefined;
  }
}

enableLiveReloadServer();

export function reloadAll() {
  console.log('send reload');
  if (wss) {
    wss.clients.forEach(client => client.send('reload'));
  }
}
