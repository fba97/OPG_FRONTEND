// src/app/partita/services/game-state.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { switchMap, catchError, tap, shareReplay, map } from 'rxjs/operators';
import { Combattimento, PartitaSoft, Turno } from '../../dto/game';
import { Personaggio } from '../../dto/personaggio';

export interface CombatTarget {
  attaccante: Personaggio;
  attaccato: Personaggio;
}

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

  // Bersaglio di combattimento scelto sulla mappa (click su un pezzo nemico), prima che
  // qualunque Attacco sia stato davvero eseguito — non e' quindi un Combattimento server-side
  // (che nasce solo al primo Attacco), ma la coppia di personaggi da mostrare nel combat-modal.
  private combatTargetSubject = new BehaviorSubject<CombatTarget | null>(null);
  combatTarget$ = this.combatTargetSubject.asObservable();

  setCombatTarget(target: CombatTarget) {
    this.combatTargetSubject.next(target);
  }

  clearCombatTarget() {
    this.combatTargetSubject.next(null);
  }

  // StatoPartita: 1 nuova, 2 esecuzione, 3 terminata (vittoria, impostata da AttaccoHandler
  // alla sconfitta del boss — vedi backend AttaccoHandler.cs).
  hasWon$: Observable<boolean> = this.gameState$.pipe(
    map(state => state?.statoPartita === 3)
  );

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

  // Personaggio il cui turno e' attivo in questo momento, derivato da actualTurno.idDelPersonaggioInTurno.
  // Sostituisce selectedCharacter$ (mai popolato da nessuno, selectCharacter() non e' mai chiamato).
  characterInTurno$: Observable<Personaggio | null> = this.gameState$.pipe(
    map(state => state?.personaggi?.find(p => p.id === state?.actualTurno?.idDelPersonaggioInTurno) ?? null)
  );

  // Personaggio in turno + coda dei prossimi turni, ruotando personaggiIds a partire da quello attuale.
  turnQueue$: Observable<{ current: Personaggio | null; upcoming: Personaggio[] }> = this.gameState$.pipe(
    map(state => {
      const turno = state?.actualTurno;
      const personaggi = state?.personaggi ?? [];
      if (!turno) {
        return { current: null, upcoming: [] };
      }
      const currentIdx = turno.personaggiIds.indexOf(turno.idDelPersonaggioInTurno);
      const rotatedIds = currentIdx === -1
        ? turno.personaggiIds
        : [...turno.personaggiIds.slice(currentIdx), ...turno.personaggiIds.slice(0, currentIdx)];
      const rotatedPersonaggi = rotatedIds
        .map(id => personaggi.find(p => p.id === id))
        .filter((p): p is Personaggio => !!p);
      return { current: rotatedPersonaggi[0] ?? null, upcoming: rotatedPersonaggi.slice(1) };
    })
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