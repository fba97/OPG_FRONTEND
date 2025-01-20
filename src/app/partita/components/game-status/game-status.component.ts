// src/app/partita/components/game-status/game-status.component.ts
import { Component, OnInit } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-status',
  templateUrl: './game-status.component.html',
  styleUrls: ['./game-status.component.css']
})
export class GameStatusComponent implements OnInit {
  cartaCasuale$: Observable<string>;
  combattimentiInCorso$: Observable<number>;
  isGameActive$: Observable<boolean>;

  constructor(private gameState: GameStateService) {
    // Aggiorna il GameStateService per includere questi Observable
    this.cartaCasuale$ = this.gameState.cartaCasuale$;
    this.combattimentiInCorso$ = this.gameState.combattimentiInCorso$;
    this.isGameActive$ = this.gameState.isGameActive$;
  }

  ngOnInit(): void {}

  saveGame()
  {
    this.gameState.saveGame();
  }
  endGame()
  {
    this.gameState.endGame();
  }
}