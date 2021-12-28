import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TempstatRoutingModule } from './tempstat-routing.module';
import { TempstatComponent } from './tempstat.component';

@NgModule({
  declarations: [TempstatComponent],
  imports: [CommonModule, TempstatRoutingModule],
})
export class TempstatModule {}
