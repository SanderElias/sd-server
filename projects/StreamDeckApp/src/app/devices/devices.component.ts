import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {map, tap} from 'rxjs/operators';

@Component({
  selector: 'app-devices',
  template: `
    <table>
      <thead>
        <tr>
          <th *ngFor="let key of keys$ | async">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of table$ | async">
          <th *ngFor="let key of keys$ | async">{{ row[key] }}</th>
        </tr>
      </tbody>
    </table>
  `,
  styleUrls: ['./devices.component.css'],
})
export class DevicesComponent implements OnInit {
  table$ = this.http.get('http://localhost:8001/devices').pipe(
    tap((r) => console.log(r)),
    map((table: any[]) => table.map((row) => ({...row, ...row.state})))
  );
  keys$ = this.table$.pipe(
    map((table: any[]) =>
      table.reduce((fields, row) => {
        Object.keys(row).forEach((key) => {
          if (!fields.includes(key)) {
            fields.push(key);
          }
        });
        return fields;
      }, [])
    ),
    tap((k) => console.log('keys', k)),
    map((keys) =>
      keys.filter(
        (key: string) => ['id', 'name', 'type', 'on', 'presence'].findIndex((k) => key.includes(k)) !== -1
      )
    )
  );

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}
}
