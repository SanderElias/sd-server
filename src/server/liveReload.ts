import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Server } from 'ws';
import { decode, encode } from '../utils/cbor';
import { log, logError, yellow } from '../utils/log';
import { settings } from './settings';
import { WsMessage } from './WsMessage';

const events = new Subject<WsMessage>();
export const events$ = events.asObservable();
export const listenFor = (type: string) => events$.pipe(filter((ev) => ev.type === type));

let wss: Server | undefined;
async function enableLiveReloadServer() {
  try {
    log('enable reload on port', settings.reloadPort);
    // tslint:disable-next-line:only-arrow-functions
    wss = new Server({ port: settings.reloadPort });
    wss.on('connection', (client) => {
      client.binaryType = 'arraybuffer';
      client.addEventListener('message', (ev) => handleMesage(client, ev as unknown as MessageEvent));
      client.send(encode({ type: 'hello' }));
    });
  } catch (e) {
    logError(`
-----------------------------------
The port "${yellow(settings.reloadPort)}" is not available for the websocket server.
live reload will not be available. You can configure a different port in the config file.
-----------------------------------`);
    console.error(e);
    wss = undefined;
  }
}

enableLiveReloadServer();

export function reloadAll() {
  console.log('send reload');
  broadcast({ type: 'reload' });
}

export const broadcast = (msg: WsMessage) => {
  if (wss) {
    const { client: _, ...outMsgData } = msg;
    const outMsg = encode(outMsgData);
    wss.clients.forEach((client) => {
      client.send(outMsg);
    });
  }
};

export const send = (msg: WsMessage) => {
  const { client, ...outMsg } = msg;
  if (client === undefined) {
    throw new Error(`Client not defined in msg`);
  }
  client.send(encode(outMsg));
};

function handleMesage(client, message: MessageEvent) {
  try {
    console.log(decode(message.data));
    events.next({ ...decode(message.data), client });
  } catch (e) {
    console.error(e);
  }
}
