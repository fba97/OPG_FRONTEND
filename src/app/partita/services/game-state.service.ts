// src/app/partita/services/game-state.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { switchMap, catchError, tap, shareReplay, map } from 'rxjs/operators';
import { Combattimento, PartitaSoft, Turno } from '../../dto/game';
import { Personaggio } from '../../dto/personaggio';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private readonly UPDATE_URL = 'https://localhost:7087/api/Update/GetUpdatePartitaSoft';
  private readonly POLLING_INTERVAL = 1000; 
  
  // Main game state
  private gameStateSubject = new BehaviorSubject<PartitaSoft | null>(null);
  gameState$ = this.gameStateSubject.asObservable().pipe(shareReplay(1));

  // Subjects specifici per componenti che necessitano di aggiornamenti
  private selectedCharacterSubject = new BehaviorSubject<Personaggio | null>(null);
  selectedCharacter$ = this.selectedCharacterSubject.asObservable();

  private currentCombatSubject = new BehaviorSubject<Combattimento | null>(null);
  currentCombat$ = this.currentCombatSubject.asObservable();

  // Add the missing subjects
  private cartaCasualeSubject = new BehaviorSubject<string>('');
  cartaCasuale$ = this.cartaCasualeSubject.asObservable();

  // Attiva quando l'ultimo polling ha trovato una partita in corso (nessun subject manuale:
  // prima non veniva mai impostato a true da nessuna parte, quindi i controlli "Salva/Termina
  // partita" restavano invisibili per sempre)
  isGameActive$ = this.gameState$.pipe(
    map(state => state !== null)
  );

  private currentTurnSubject = new BehaviorSubject<string>('Giocatore');
  currentTurn$ = this.currentTurnSubject.asObservable();

  private turnNumberSubject = new BehaviorSubject<number>(1);
  turnNumber$ = this.turnNumberSubject.asObservable();

  private isPlayerTurnSubject = new BehaviorSubject<boolean>(true);
  isPlayerTurn$ = this.isPlayerTurnSubject.asObservable();


  // Derive combattimentiInCorso$ from gameState
  combattimentiInCorso$ = this.gameState$.pipe(
    map(state => state?.combattimenti?.length ?? 0)
  );

  // Turno corrente (azioni residue / massime), aggiornato ad ogni polling dal backend
  actualTurno$: Observable<Turno | null> = this.gameState$.pipe(
    map(state => state?.actualTurno ?? null)
  );


  private updatePolling: any;


  constructor(private http: HttpClient) {
    this.startPolling();
  }

  private startPolling() {
    this.updatePolling = timer(0, this.POLLING_INTERVAL).pipe(
      switchMap(() => this.fetchGameUpdate())
    ).subscribe({
      error: (error) => console.error('Polling error:', error)
    });
  }

  private fetchGameUpdate(): Observable<PartitaSoft | null> {
    return this.http.get<PartitaSoft>(this.UPDATE_URL).pipe(
      tap(gameState => {
        this.gameStateSubject.next(gameState);
        this.updateDerivedStates(gameState);
      }),
      catchError(error => {
        // Non rilanciare l'errore: altrimenti il polling (timer + switchMap) si fermerebbe
        // per sempre al primo errore (es. nessuna partita ancora caricata), invece di
        // riprovare al giro successivo.
        console.error('Error fetching game update:', error);
        this.gameStateSubject.next(null);
        return of(null);
      })
    );
  }

  nextTurn() {
    // Incrementa il numero del turno
    const currentTurnNumber = this.turnNumberSubject.value;
    this.turnNumberSubject.next(currentTurnNumber + 1);

    // Alterna tra turno giocatore e NPC
    const isCurrentlyPlayerTurn = this.isPlayerTurnSubject.value;
    this.isPlayerTurnSubject.next(!isCurrentlyPlayerTurn);
    
    // Aggiorna il nome del turno corrente
    const nextTurn = isCurrentlyPlayerTurn ? 'NPC' : 'Giocatore';
    this.currentTurnSubject.next(nextTurn);

    // Qui puoi aggiungere logica aggiuntiva per il cambio turno
    // Per esempio, aggiornare lo stato del gioco o eseguire azioni specifiche
  }

  private updateDerivedStates(gameState: PartitaSoft) {

    // Mantieni la selezione del personaggio corrente
    if (this.selectedCharacterSubject.value) {
      const currentSelectedId = this.selectedCharacterSubject.value.id;
      const updatedCharacter = gameState.personaggi.find(p => p.id === currentSelectedId);
      if (updatedCharacter) {
        this.selectedCharacterSubject.next(updatedCharacter);
      }
    }
  }

  // Public methods per l'interazione con il game state
  selectCharacter(character: Personaggio | null) {
    this.selectedCharacterSubject.next(character);
  }

  getSelectedCharacter(): Personaggio | null {
    return this.selectedCharacterSubject.value;
  }

  getCombattimentiAttivi(): Combattimento[] {
    return this.gameStateSubject.value?.combattimenti || [];
  }

  // Metodo per forzare un aggiornamento immediato
  forceUpdate(): Observable<PartitaSoft | null> {
    return this.fetchGameUpdate();
  }

  // Cleanup
  stopPolling() {
    if (this.updatePolling) {
      this.updatePolling.unsubscribe();
    }
  }
}