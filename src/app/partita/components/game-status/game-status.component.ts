// src/app/partita/components/game-status/game-status.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';
import { PartitaService } from '../../../partita.service';
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

  messaggioSalvataggio = '';

  constructor(private gameState: GameStateService, private partitaService: PartitaService, private router: Router) {
    this.cartaCasuale$ = this.gameState.cartaCasuale$;
    this.combattimentiInCorso$ = this.gameState.combattimentiInCorso$;
    this.isGameActive$ = this.gameState.isGameActive$;
  }

  ngOnInit(): void {}

  saveGame() {
    this.messaggioSalvataggio = '';
    this.partitaService.saveGame().subscribe({
      next: (messaggio) => this.messaggioSalvataggio = String(messaggio),
      error: (err) => this.messaggioSalvataggio = 'Errore nel salvataggio: ' + (err?.error ?? err?.message ?? err)
    });
  }

  endGame() {
    this.router.navigateByUrl('/homepage');
  }
}
