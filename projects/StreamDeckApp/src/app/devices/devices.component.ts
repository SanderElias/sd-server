/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { DndListComponent } from './dnd-list/dnd-list.component';

@Component({
  selector: 'app-devices',
  template: `
    <table>
      <thead>
        <tr>
          @for (key of $keys(); track key) {
            <th>{{ key }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of $table(); track row) {
          <tr>
            @for (key of $keys(); track key) {
              <td>{{ row[key] }}</td>
            }
          </tr>
        }
      </tbody>
    </table>
    <dnd-list
      [available]="$available_keys()"
      [(selected)]="$selected"
    ></dnd-list>
  `,
  styleUrls: ['./devices.component.css'],
  standalone: true,
  imports: [AsyncPipe, DndListComponent],
})
export class DevicesComponent {
  http = inject(HttpClient);
  $table = toSignal(
    this.http.get<unknown[]>('http://localhost:8001/devices').pipe(
      map((table) =>
        table.map((row) => {
          const { state, ...rest } = row as any;
          return { ...rest, ...state };
        }),
      ),
    ),
  );
  $selected = signal(['etag', 'modelid', 'name', 'type', 'on', 'presence']);
  $available_keys = computed(() => {
    const data = this.$table();
    if (!data) return [];
    const keys: string[] = data.reduce((fields, row) => {
      Object.keys(row).forEach((key) => {
        if (!fields.includes(key)) {
          fields.push(key);
        }
      });
      return fields;
    }, [] as string[]);
    console.log(keys);
    return keys;
  });
  $keys = computed(() => {
    const sel = this.$selected();
    return this.$available_keys().filter((key: string) => sel.findIndex((k) => key.startsWith(k)) !== -1);
  });
}
