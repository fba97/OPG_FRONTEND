import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { GameStateService } from '../../services/game-state.service';
import { Personaggio } from '../../../dto/personaggio';
import { resolvePersonaggioImage } from '../../../shared/character-portrait';

@Component({
  selector: 'app-turn',
  templateUrl: './turn.component.html',
  styleUrls: ['./turn.component.css']
})
export class TurnComponent {
  turnQueue$: Observable<{ current: Personaggio | null; upcoming: Personaggio[] }>;

  constructor(private gameState: GameStateService) {
    this.turnQueue$ = this.gameState.turnQueue$;
  }

  resolveImage(personaggio: Personaggio | null | undefined): string {
    return resolvePersonaggioImage(personaggio);
  }
}
