import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'buttons',
    loadChildren: () => import('./buttons/buttons.component').then((m) => m.ButtonsComponent),
    title: 'components',
  },
  {
    path: 'temp',
    loadComponent: () => import('./tempstat/tempstat.component').then((m) => m.TempstatComponent),
    title: 'temps',
  },
  {
    path: 'dev',
    loadComponent: () => import('./devices/devices.component').then((m) => m.DevicesComponent),
    title: 'devices',
  },
  {
    path: 'mqtt',
    loadComponent: () => import('./mqtt/mqtt.component').then((m) => m.MqttComponent),
    title: 'Mqtt',
  },
  { path: '**', redirectTo: 'mqtt' },
];
