import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TempstatComponent } from './tempstat.component';

const routes: Routes = [{ path: '', component: TempstatComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TempstatRoutingModule {}
