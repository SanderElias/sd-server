import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebSocketService } from './web-socket.service.js';
import { NavComponent } from "./nav/nav.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterOutlet, NavComponent]
})
export class AppComponent {
  title = 'StreamDeckApp';
  #wss= inject( WebSocketService)
  constructor() {
    this.#wss.init()
  }
}
