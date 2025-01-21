import { Component, OnInit } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-turn-info',
  templateUrl: './turn-info.component.html',
  styleUrls: ['./turn-info.component.css']
})
export class TurnInfoComponent implements OnInit {
  currentTurn$: Observable<string>;
  turnNumber$: Observable<number>;
  isPlayerTurn$: Observable<boolean>;

  constructor(private gameState: GameStateService) {
    
    this.currentTurn$ = this.gameState.currentTurn$;
    this.turnNumber$ = this.gameState.turnNumber$;
    this.isPlayerTurn$ = this.gameState.isPlayerTurn$;
  }

  ngOnInit(): void {}

  endTurn() {
    //this.gameState.nextTurn();
  }
}