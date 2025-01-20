// right-sidebar.component.ts
import { Component } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.css']
})
export class RightSidebarComponent {
  isOpen = true;

  constructor(private gameState: GameStateService) {}

  toggle() {
    this.isOpen = !this.isOpen;
  }
}