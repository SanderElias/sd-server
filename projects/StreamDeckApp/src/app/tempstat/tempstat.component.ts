import {HttpClient} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {of} from 'rxjs';
import {filter, map, pluck, tap} from 'rxjs/operators';
import {WebSocketService} from '../web-socket.service';

@Component({
  selector: 'app-tempstat',
  template: `
    <h1>Temprature right now</h1>
    <p>{{ (temp$ | async)?.temp }}°</p>
    <div class="graph">
      <div class="temp" *ngFor="let row of hist" [style.background]="bg(row.temp)">
        {{ row.time | date: 'dd-MM hh:mm' }}
        - {{ row.temp }}
      </div>
    </div>
    <style>
      p {
        font-size: 128px;
      }
      .graph {
        display: grid;
        width: 96vw;
        height: 400px;
        gap: 4px;
        padding: 10px;
        margin: 10px;
        grid-template-columns: repeat(auto-fit , minmax(1.5rem,1fr))
        /* transform: rotate(270deg); */
      }
      .temp {
        display: block;
        writing-mode:vertical-rl;
        padding:3px;
      }
    </style>
  `,
})
export class TempstatComponent implements OnDestroy {
  hist: {time: Date; temp: number}[] = [];
  tempSub = this.http
    .get('http://localhost:8001/temperatures')
    .pipe(
      map((t: any[]) =>
        t.sort((a, b) => (a[1] < b[1] ? -1 : 1)).map((row) => ({time: row[1], temp: +row[2] / 100}))
      ),
      tap((temps) => {
        temps.forEach((r) => this.hist.push(r));
      })
    )
    .subscribe();

  temp$ = this.sock.listenFor('temprature').pipe(
    pluck('payload'),
    tap((r) => console.log(r)),
    filter((r) => r.temperature),
    map((r) => ({time: new Date(r.lastupdated), temp: r.temperature / 100})),
    tap((r) => this.hist.push(r))
  );

  constructor(private sock: WebSocketService, private http: HttpClient) {}

  ngOnDestroy(): void {
    this.tempSub.unsubscribe();
  }

  tmp2per(tmp: number) {
    const p = 42 / 100; // calc 1%
    return tmp / p;
  }

  bg(temp) {
    return `linear-gradient(0deg, #FFC0CB ${this.tmp2per(temp)}%, #00FFFF ${this.tmp2per(temp)}%)`;
  }
}
