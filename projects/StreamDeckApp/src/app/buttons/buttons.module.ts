import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonsRoutingModule } from './buttons-routing.module';
import { ButtonsComponent } from './buttons.component';
import { SdButtonComponent } from './button/button.component';

@NgModule({
  declarations: [ButtonsComponent, SdButtonComponent],
  imports: [CommonModule, ButtonsRoutingModule],
})
export class ButtonsModule {}
