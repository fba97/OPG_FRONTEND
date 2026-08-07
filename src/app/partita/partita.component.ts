// src/app/partita/partita.component.ts
import { Component, OnInit } from '@angular/core';
import { GameStateService } from './services/game-state.service';

@Component({
  selector: 'app-partita',
  templateUrl: './partita.component.html',
  styleUrls: ['./partita.component.css']
})
export class PartitaComponent implements OnInit {
  isSidebarVisible = true;

  menuItems = [
    { name: 'Torna alla home', url: 'http://localhost:4200/homepage' },
    { name: 'Eroi', url: 'http://localhost:4200/personaggi' }
  ];

  constructor(private gameState: GameStateService) {}

  ngOnInit(): void {}

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}