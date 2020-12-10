import compression from 'compression';
import cors from 'cors';
import express from 'express';
import {join, resolve} from 'path';
import {src} from '../DynamicTs';
import {getTable} from '../homeAutomation/deconz';
import {pool} from '../homeAutomation/pg-client';
import {log, logError, yellow} from '../utils/log';
import {settings} from './settings';

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
      console.log(asset);
      res.sendFile(asset);
    });
    server.get('/image/:fileName', (req, res) => {
      const asset = resolve(__dirname, '../../../assets', req.params.fileName);
      console.log(asset);
      res.sendFile(asset);
    });
    server.use(express.static(hostFolder, options));
    server.get('*', (req, res) => res.sendFile(join(hostFolder, '/index.html')));

    server.listen(settings.port, settings.hostName, () => {
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
    server.use(cors());
    // server.use(injectReloadMiddleware)
    server.get('/ping', (req, res) => {
      res.send(`pong`);
    });
    server.get('/devices', (req, res) => {
      res.send(getTable());
    });

    server.get('/temperatures', async (req, res) => {
      const query = {
        text: 'select * from tempratures ORDER BY prim DESC LIMIT 30',
        rowMode: 'array',
      };
      const {rows} = await pool.query(query);
      res.send(rows);
    });

    server.get('*', (req, res) => {
      res.send(`pong`);
    });

    // postgresDBforPromitor

    server.listen(8001, () => {
      log(`Hook server started on "${yellow(`http${settings.ssl ? 's' : ''}://localhost:8001/`)}"`);
    });
  } catch (e) {
    logError(e);
  }
}
