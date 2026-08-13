// src/app/partita/partita.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GameStateService } from './services/game-state.service';
import { SidebarMenuItem } from './components/left-sidebar/left-sidebar.component';
import { DIZIONARI_MENU, TORNA_ALLA_HOME } from '../shared/nav-menu';

@Component({
  selector: 'app-partita',
  templateUrl: './partita.component.html',
  styleUrls: ['./partita.component.css']
})
export class PartitaComponent implements OnInit {
  menuItems: SidebarMenuItem[] = [TORNA_ALLA_HOME, ...DIZIONARI_MENU];

  hasWon$!: Observable<boolean>;

  constructor(private gameState: GameStateService) {}

  ngOnInit(): void {
    this.hasWon$ = this.gameState.hasWon$;

    // Il turno dei nemici NON si salta più da qui. Veniva fatto in questo punto quando i
    // nemici non avevano alcun comportamento e il gioco sarebbe rimasto bloccato sul loro
    // turno; ora il backend risolve il turno nemico dentro ConcludiTurno (i mostri si
    // muovono e attaccano davvero) e restituisce il controllo già al turno dell'eroe
    // successivo. Lasciare qui il salto significherebbe rubare ai nemici il loro turno.
  }
}
