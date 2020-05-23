import {Component, OnInit} from '@angular/core';
import {combineLatest} from 'rxjs';
import {tap, map} from 'rxjs/operators';
import {WebSocketService} from '../web-socket.service';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.css'],
})
export class ButtonsComponent implements OnInit {
  pressedButtons$ = this.wss.listenFor('sdButton');
  btnList$ = this.wss.listenFor('cmdList').pipe(
    map(ev => ev.payload.reduce((tm, t) => {
      tm[+t.tile] = t;
      return tm;
    }, Array.from({ length: 15 }, (e, i) => i))),
    tap(l => console.table(l))
  );

  sendReset() {
    this.wss.send({type:'resetDeck'})
  }

  constructor(private wss: WebSocketService) {}

  ngOnInit(): void {
    // console.table(this.buttons)
    combineLatest(this.btnList$)
      .pipe(tap(([msg]) => console.log(msg)))
      .subscribe();
    this.wss.send({type: 'fetchList'});
  }
}
