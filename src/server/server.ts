import {logError, yellow, log, logWarn} from '../utils/log';
import express from 'express';
import compression from 'compression';
import {join, resolve} from 'path';
import {settings} from './settings';
import {injectReloadMiddleware} from './injectReloadMiddleware';
import {src} from '../DynamicTs';

export async function sdServer() {
  try {
    const options = {
      dotfiles: 'ignore',
      etag: false,
      extensions: ['htm', 'html'],
      index: ['index.html'],
      /** use a sensible setting for dev time. */
      maxAge: '30s',
      redirect: true,
      setHeaders(res, path, stat) {
        res.set('x-timestamp', Date.now());
      },
    };
    const hostFolder = join(__dirname, settings.publicFolder);
    // console.log(hostFolder);

    const server = express();
    server.use(compression());
    // server.use(injectReloadMiddleware)
    server.get('/action/:fileName', (req, res) => {
      const asset = resolve(src, 'actions', req.params.fileName);
      res.sendFile(asset);
    });
    server.get('/assets/:fileName', (req, res) => {
      const asset = resolve(__dirname, '../../assets', req.params.fileName);
      console.log(asset)
      res.sendFile(asset);
    });
    server.get('/image/:fileName', (req, res) => {
      const asset = resolve(__dirname, '../../../assets', req.params.fileName);
      console.log(asset)
      res.sendFile(asset);
    });
    server.use(express.static(hostFolder, options));
    server.get('*', (req, res) => res.sendFile(join(hostFolder, '/index.html')));

    server.listen(settings.port, settings.hostName, x => {
      log(
        `StreamDeck server started on "${yellow(
          `http${settings.ssl ? 's' : ''}://${settings.hostName}:${settings.port}/`
        )}"`
      );
    });
  } catch (e) {
    logError(e);
  }
}
export async function hookServer() {
  try {
    const options = {
      dotfiles: 'ignore',
      etag: true,
      extensions: ['htm', 'html'],
      index: ['index.html'],
      /** use a sensible setting for dev time. */
      maxAge: '30s',
      redirect: true,
      setHeaders(res, path, stat) {
        res.set('x-timestamp', Date.now());
      },
    };

    const server = express();
    server.use(compression());
    // server.use(injectReloadMiddleware)
    server.get('/ping', (req, res) => {
      res.send(`pong`);
    });

    server.get('*', (req, res) => {
      res.send(`pong`);
    });

    server.listen(8001,'2001:41f0:198:0:3034:f593:acdc:acdc', x => {
      log(
        `Hook server started on "${yellow(
          `http${settings.ssl ? 's' : ''}://2001:41f0:198:0:3034:f593:acdc:acdc:8001/`
        )}"`
      );
    });
  } catch (e) {
    logError(e);
  }
}
