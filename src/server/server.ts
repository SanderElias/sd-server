import {logError, yellow, log} from '../utils/log';
import express from 'express';
import compression from 'compression';
import {join, resolve} from 'path';
import {settings} from './settings';
import {injectReloadMiddleware} from './injectReloadMiddleware';

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
    server.get('/image/:fileName', function(req, res) {
      const asset = resolve(__dirname, '../../../assets', req.params.fileName);
      // console.log(asset);
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
