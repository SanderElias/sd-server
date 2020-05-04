import {get, request, RequestOptions} from 'http';
import {get as getHttps} from 'https';
import {logError} from './log';

export interface HeadersObject {
  [headerName: string]: string;
}

let needWarn = true;
export const logWarnOnce = (...args) => {
  if (needWarn) {
    logError(...args);
    needWarn = false;
  }
};

interface httpGetJsonOptions {
  suppressErrors?: boolean;
  headers?: HeadersObject;
  method?: 'get' | 'post' | 'delete' | 'put';
  data?: any;
}

export function httpGetJson<T>(
  url: string,
  {suppressErrors, headers, method, data}: httpGetJsonOptions = {
    suppressErrors: false,
    headers: {},
  }
): Promise<T> {
  const isSSL = url.toLowerCase().includes('https:');
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  // const httpGet = isSSL ? getHttps : get;
  const rawPostData = data ? JSON.stringify(data) : '';
  suppressErrors = typeof suppressErrors !== 'boolean' ? false : suppressErrors;
  headers = headers || {};
  method = method || 'get';
  return new Promise((resolve, reject) => {
    const {pathname, hostname, port, protocol, search, hash} = new URL(url);
    if (data) {
      // tslint:disable: no-non-null-assertion
      headers!['Content-Type'] = 'application/json';
      headers!['Content-Length'] = '' + rawPostData.length;
    }
    const opt: RequestOptions = {
      protocol,
      hostname,
      method,
      port,
      path: pathname + search + hash,
      headers,
    };
    let rawData = '';
    const req = request(opt, res => {
      const {statusCode} = res;
      const contentType = res.headers['content-type'];
      let error: Error;
      if (statusCode !== 200) {
        error = new Error(`
-------------------------------------------------------------
Request Failed. Received status code: ${statusCode} ${res.statusMessage}
${JSON.stringify(rawData, undefined, 4)}
on url: ${url}
-------------------------------------------------------------
`);
      } else if (!/^application\/json/.test(contentType!)) {
        error = new Error(`Invalid content-type.
Expected application/json but received ${contentType}
on url: ${url}`);
      }
      if (error!) {
        // console.error(error.message);
        // Consume response data to free up memory
        res.resume();
        return reject(error!);
      }
      res.setEncoding('utf8');
      res.on('data', chunk => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          console.error(e.message);
          return reject(error);
        }
      });
    });
    req.on('error', e => {
      if (!suppressErrors) {
        // console.error(`Got error: ${e.message}`);
        reject(e);
      } else {
        resolve(undefined);
      }
    });
    if (method && ['post', 'put'].includes(method) && data !== undefined) {
      req.write(rawPostData);
    }
    req.end();
  });
}
