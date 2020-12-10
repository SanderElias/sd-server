import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
  {path: 'buttons', loadChildren: () => import('./buttons/buttons.module').then((m) => m.ButtonsModule)},
  {path: 'temp', loadChildren: () => import('./tempstat/tempstat.module').then((m) => m.TempstatModule)},
  { path: 'dev', loadChildren: () => import('./devices/devices.module').then(m => m.DevicesModule) },
  {path: '**', redirectTo: 'dev'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
