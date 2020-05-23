import { Component, Input, OnInit } from '@angular/core';
import { Command } from 'src/streamDeck/Command.interface';

@Component({
  selector: 'sd-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class SdButtonComponent implements OnInit {
  @Input() buttonData: Command;

  constructor() {}

  ngOnInit(): void {
    console.log(this.buttonData)
  }
}
