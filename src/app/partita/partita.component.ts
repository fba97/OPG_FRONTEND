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
    { name: 'Mainpage', url: 'http://localhost:4200/mainpage' },
    { name: 'Login', url: 'http://localhost:4200/login' },
    { name: 'Register', url: 'http://localhost:4200/register' },
    { name: 'Eroi', url: 'http://localhost:4200/personaggi' },
    { name: 'Combattimento', url: 'http://localhost:4200/combattimento' }
  ];

  constructor(private gameState: GameStateService) {}

  ngOnInit(): void {}

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}