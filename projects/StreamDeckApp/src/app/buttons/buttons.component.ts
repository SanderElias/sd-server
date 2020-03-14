import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.css'],
})
export class ButtonsComponent implements OnInit {
  buttons = Array.from({length: 15}, (e, i) => ({image: i}));

  constructor() {}

  ngOnInit(): void {
    // console.table(this.buttons)
  }
}
