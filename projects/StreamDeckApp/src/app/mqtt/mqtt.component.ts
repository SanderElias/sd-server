import { JsonPipe } from '@angular/common';
import { Component, OnDestroy, inject, linkedSignal, type Signal } from '@angular/core';
import { filter, repeat, share, switchMap, takeUntil, tap, timer } from 'rxjs';
import { injectMqttLister, MqttService } from './mqtt.service';
import type { Z2MDevices } from './mqtt.types';

type Z2MStateDevices = Z2MDevices & { state: Signal<Record<string, unknown>> };

@Component({
  selector: 'app-mqtt',
  imports: [JsonPipe],
  templateUrl: './mqtt.component.html',
  styleUrl: './mqtt.component.css',
})
export class MqttComponent implements OnDestroy {
  mqtt = inject(MqttService);
  listen = injectMqttLister();

  test = this.listen('Shop');

  button$ = this.mqtt.listenFor('LichtknopBuro/action').pipe(
    tap((msg) => console.log(msg)),
    share(),
  );
  lamp$ = this.mqtt
    .listenFor('Buro licht panel')
    .pipe(tap((msg) => console.log(msg)))
    .subscribe();
  brightDown_down$ = this.button$.pipe(filter((msg) => msg === 'brightness_down_hold'));
  brightDown_up$ = this.button$.pipe(filter((msg) => msg === 'brightness_down_release'));

  devices: Signal<Z2MDevices[]> = this.listen('bridge/devices');
  $state = linkedSignal({
    source: this.devices,
    computation: (devices: Z2MDevices[], prev: { source: Z2MDevices[]; value: Z2MStateDevices[] }) => {
      return devices.map((device) => {
        const state =
          prev?.value?.find((d) => d.friendly_name === device.friendly_name)?.state ??
          this.getCurrentState(device.friendly_name);
        return {
          ...device,
          state,
        } as Z2MStateDevices;
      });
    },
  });

  getCurrentState = (device: string) => {
    const result = this.listen(`${device}`);
    this.mqtt.send(`${device}/get`, { state: '' });
    return result;
  };

  setState = (device: string, state: string) => {
    this.mqtt.action(device, { state });
  };

  sub = this.brightDown_down$
    .pipe(
      switchMap(() => timer(0, 100)),
      takeUntil(this.brightDown_up$),
      repeat(),
    )
    .subscribe((data) => {
      console.log(data);
    });

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.lamp$.unsubscribe();
  }

  inspect = (data: unknown) => {
    console.dir(data, { depth: 3, expand: true });
  };
}
