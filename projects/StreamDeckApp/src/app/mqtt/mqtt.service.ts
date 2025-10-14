import { effect, inject, Injectable, Injector, signal, type Signal } from '@angular/core';
import type { OnMessageCallback } from 'mqtt';
import { filter, map, Observable, share, Subject, tap, type Subscription } from 'rxjs';
import type { MqttMessage } from './mqtt.types';
import { deepEqual } from '../util/deep-equal';

@Injectable({ providedIn: 'root' })
export class MqttService {
  mqtt = import('mqtt');
  client = this.mqtt.then((m) => m.default.connectAsync(`ws://localhost:1884`));
  /** base topic */
  readonly bt = 'zigbee2mqtt';
  messages$ = new Observable<MqttMessage>((subscriber) => {
    const cb: OnMessageCallback = (topic, message): void => {
      // console.log('mqtt message', topic, message.toString());
      subscriber.next({ topic, message: message.toString() });
    };

    this.client.then((client) => {
      console.log('start listening for MQTT messages');
      client.on('message', cb);
    });
    return () => {
      console.log('stop listening for MQTT messages');
      this.client.then((client) => client.off('message', cb));
    };
  }).pipe(
    share({
      connector: () => new Subject(),
      resetOnComplete: true,
    }),
  );

  state = signal<Record<string, unknown>>({});

  send = async (topic: string, payload: Record<string, unknown> | string) => {
    topic = topic.startsWith(this.bt) ? topic : `${this.bt}/${topic}`;
    const cl = await this.client;
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    console.log('send', topic, message);
    const result = await cl.publishAsync(topic, message, { qos: 1 });
    console.log('send result', result);
    return result;
  };

  action = async (device, status) => {
    // const currentState = await firstValueFrom(this.listenFor(`${this.bt}/${device}/get`));
    // console.log('currentState', currentState);
    const cl = await this.client;
    const topic = `${this.bt}/${device}/set`;
    const message = JSON.stringify(status);
    console.log('action', topic, message);
    const result = await cl.publishAsync(topic, message, { qos: 1 });
    const get = `${this.bt}/${device}/get`;
    // const r = await cl.publishAsync(get, `{ "state":''}`);
    // console.log('action get', get, r);
    return result;
  };

  listenFor<T = unknown>(topics: string | string[]): Observable<T> {
    const cl = this.client;
    topics = (Array.isArray(topics) ? topics : [topics]).map((topic) =>
      topic.startsWith(this.bt) ? topic : `${this.bt}/${topic}`,
    );
    cl.then((client) => {
      client.subscribe(topics);
      console.log('start listening', topics);
    });

    return this.messages$.pipe(
      filter(({ topic }) => topics.includes(topic)),
      tap({
        error() {
          cl.then((client) => client.unsubscribe(topics));
        },
        complete() {
          cl.then((client) => client.unsubscribe(topics));
        },
      }),
      map(({ message }) => {
        try {
          return JSON.parse(message) as T;
        } catch {
          return message as T;
        }
      }),
    );
  }
}

export const injectMqttLister = () => {
  const mqttService = inject(MqttService);
  const injector = inject(Injector);

  return <T>(topics: string | string[]): Signal<T> => {
    const result = signal<T>({} as T,{equal:deepEqual});
    const topicsArray = (Array.isArray(topics) ? topics : [topics]).map((topic) =>
      topic.startsWith(mqttService.bt) ? topic : `${mqttService.bt}/${topic}`,
    );
    let sub: Subscription | undefined;
    const ref = effect(
      async (cleanUp) => {
        const client = await mqttService.client;
        if (sub) {
          sub.unsubscribe();
        }
        sub = mqttService.messages$
          .pipe(
            filter(({ topic }) => topicsArray.includes(topic)),
            tap({
              error() {
                client.unsubscribe(topicsArray);
              },
              complete() {
                client.unsubscribe(topicsArray);
              },
            }),
            map(({ message }) => {
              try {
                return JSON.parse(message) as T;
              } catch {
                return message as T;
              }
            }),
          )
          .subscribe(msg => result.set(msg));
        cleanUp(() => {
          if (sub) {
            sub.unsubscribe();
          }
          ref.destroy();
          console.log('stop listening', topicsArray);
          client.unsubscribe(topicsArray);
        });

        client.subscribe(topicsArray);
        console.log('start listening', topicsArray);
      },
      {
        injector,
      },
    );

    return result.asReadonly();
  };
}
