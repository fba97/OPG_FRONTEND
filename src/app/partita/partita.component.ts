// src/app/partita/partita.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { GameStateService } from './services/game-state.service';
import { AzioniService } from './services/azioni.service';
import { TipoPersonaggio } from '../dto/game';
import { SidebarMenuItem } from './components/left-sidebar/left-sidebar.component';
import { DIZIONARI_MENU, TORNA_ALLA_HOME } from '../shared/nav-menu';

@Component({
  selector: 'app-partita',
  templateUrl: './partita.component.html',
  styleUrls: ['./partita.component.css']
})
export class PartitaComponent implements OnInit, OnDestroy {
  menuItems: SidebarMenuItem[] = [TORNA_ALLA_HOME, ...DIZIONARI_MENU];

  hasWon$!: Observable<boolean>;

  private turnoSub?: Subscription;
  // Nessuna IA nemica esiste ancora (vedi roadmap "Turno mappa / IA nemici"): senza questo, il
  // turno di un nemico nella rotazione (oggi puo' capitare, vedi TipoPersonaggio) mostrerebbe il
  // suo pannello controlli come se il giocatore potesse pilotarlo, e il gioco resterebbe fermo in
  // attesa di un'azione che nessuno puo' dare. Semplice "passa" automatico finche' non esiste una
  // vera IA. Chiave del guard = turnoCorrente: funziona con un solo nemico in rotazione (caso
  // attuale) ma non distingue piu' nemici consecutivi nello stesso turnoCorrente.
  private ultimoTurnoSaltato: number | null = null;

  constructor(private gameState: GameStateService, private azioniService: AzioniService) {}

  ngOnInit(): void {
    this.hasWon$ = this.gameState.hasWon$;

    this.turnoSub = combineLatest([this.gameState.characterInTurno$, this.gameState.actualTurno$])
      .subscribe(([personaggio, turno]) => {
        if (!personaggio || !turno) {
          return;
        }
        const isNemico = personaggio.tipoPersonaggio === TipoPersonaggio.NemicoNPC
                       || personaggio.tipoPersonaggio === TipoPersonaggio.NemicoPersonaggio;
        if (isNemico && this.ultimoTurnoSaltato !== turno.turnoCorrente) {
          this.ultimoTurnoSaltato = turno.turnoCorrente;
          this.azioniService.concludiTurno().subscribe();
        }
      });
  }

  ngOnDestroy(): void {
    this.turnoSub?.unsubscribe();
  }
}
