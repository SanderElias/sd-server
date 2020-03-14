import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sd-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class SdButtonComponent implements OnInit {
  @Input() image = "terminal-icon.png"

  constructor() {
  }

  ngOnInit(): void {
  }

}
