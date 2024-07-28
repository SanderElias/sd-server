import { Component, signal } from '@angular/core';
import { IconifyIconComponent } from '../iconify-icon.directive';
import { routes } from '../app.routing';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
  imports: [IconifyIconComponent, RouterLink],
  host: {
    '[class.selected]': '$selected()',
    '(hover)': '$selected.set(true)',
    '(click)': '$selected.set(!$selected())',
  },
})
export class NavComponent {
  $selected = signal(false);
  $routes = signal(routes)
  $titles = this.$routes().map(route => route.title).filter(r => !!r)
  $icon = () =>  {
    return this.$selected() ? 'line-md:menu-to-close-transition' : 'line-md:close-to-menu-transition'
  }
}
