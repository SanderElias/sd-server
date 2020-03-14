import {join} from 'path';
import {settings} from './settings';
import {existsSync, readFileSync} from 'fs';

export function injectReloadMiddleware(req, res, next) {
  const url = req.url;
  let path: string;
  const hostFolder = join(__dirname, settings.publicFolder);
  if (url.endsWith('/') || url.endsWith('index.html')) {
    if (url.endsWith('/')) {
      path = join(hostFolder, url, 'index.html');
    } else {
      path = join(hostFolder, url);
    }
    // console.log(path);
    if (existFolder(path)) {
      const content = readFileSync(path, 'utf8').toString();
      try {
        const [start, endPart] = content.split('</body>');
        const injected = start + createScript() + '</body>' + endPart;
        res.set('Content-Type', 'text/html');
        // console.log('injected', req.url);
        return res.send(injected);
      } catch (e) {
        console.error(e);
      }
      //       console.log(`
      // --------------------------------------------
      // Time:, ${new Date().toISOString().split('T')[1]};
      // url: ${req.url}
      // --------------------------------------------`);
    }
  }
  next();
}
export function existFolder(src) {
  try {
    return existsSync(src);
  } catch (e) {
    return false;
  }
}
export function createScript(): string {
  return `
  <script>
  let wSocket;
  let tries = 0;
  const connect = () => {
    try {
    wSocket = new WebSocket('ws://${settings.hostName}:${settings.reloadPort}');
    wSocket.addEventListener('open', () => {
      try {
        wSocket.send('hello');
      } catch (e) {}
    });

    wSocket.addEventListener('message', evt => {
      if (evt && evt.data === 'reload') {
        console.log('Reload command received')
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
  } catch(e) {
    setTimeout(connect,1500)
  }
  };
  connect();
  </script>
`;
}
