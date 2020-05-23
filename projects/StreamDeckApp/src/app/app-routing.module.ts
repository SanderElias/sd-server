import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
  {path: 'buttons', loadChildren: () => import('./buttons/buttons.module').then(m => m.ButtonsModule)},
  {path: '**', redirectTo:'buttons'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
