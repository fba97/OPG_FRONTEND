// src/app/partita/components/character-info/character-info.component.ts
import { Component, OnInit } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { Observable } from 'rxjs';
import { Personaggio } from '../../../dto/game';  // Changed import to use the one from game.ts

@Component({
  selector: 'app-character-info',
  templateUrl: './character-info.component.html',
  styleUrls: ['./character-info.component.css']
})
export class CharacterInfoComponent implements OnInit {
  selectedCharacter$: Observable<Personaggio | null>;

  constructor(private gameState: GameStateService) {
    this.selectedCharacter$ = this.gameState.selectedCharacter$;
  }

  ngOnInit(): void {}
}