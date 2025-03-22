/* eslint-disable @angular-eslint/component-selector */
import { Component, input } from '@angular/core';
import 'iconify-icon';

@Component({
  selector: 'iconify-icon',
  standalone: true,
  template: ``,
  styles: `
    :host {
      display: inline-block;
      width: 1em;
      height: 1em;
    }
  `,
})
export class IconifyIconComponent {
  icon = input<string>();
}
