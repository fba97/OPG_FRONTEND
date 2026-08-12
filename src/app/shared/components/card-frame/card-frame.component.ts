import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-frame',
  templateUrl: './card-frame.component.html',
  styleUrls: ['./card-frame.component.css']
})
export class CardFrameComponent {
  @Input() locked = false;
  @Input() selected = false;
  @Input() compact = false;
}
