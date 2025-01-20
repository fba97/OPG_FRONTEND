// src/app/partita/services/game-state.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { switchMap, catchError, tap, shareReplay } from 'rxjs/operators';
import { Game, ActualPartita, Personaggio, Combattimento, Missione } from '../../dto/game';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private readonly UPDATE_URL = 'https://localhost:7087/api/Update/GetUpdateTotale';
  private readonly POLLING_INTERVAL = 5000; // 5 secondi

  // Main game state
  private gameStateSubject = new BehaviorSubject<Game | null>(null);
  gameState$ = this.gameStateSubject.asObservable().pipe(shareReplay(1));

  // Subjects specifici per componenti che necessitano di aggiornamenti
  private selectedCharacterSubject = new BehaviorSubject<Personaggio | null>(null);
  selectedCharacter$ = this.selectedCharacterSubject.asObservable();

  private currentCombatSubject = new BehaviorSubject<Combattimento | null>(null);
  currentCombat$ = this.currentCombatSubject.asObservable();

  private activeMissionsSubject = new BehaviorSubject<Missione[]>([]);
  activeMissions$ = this.activeMissionsSubject.asObservable();

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

  private fetchGameUpdate(): Observable<Game> {
    return this.http.get<Game>(this.UPDATE_URL).pipe(
      tap(gameState => {
        this.gameStateSubject.next(gameState);
        this.updateDerivedStates(gameState);
      }),
      catchError(error => {
        console.error('Error fetching game update:', error);
        throw error;
      })
    );
  }

  private updateDerivedStates(gameState: Game) {
    // Aggiorna le missioni attive
    if (gameState.partitaAttuale?.missioni) {
      const activeMissions = gameState.partitaAttuale.missioni.filter(m => 
        m.stato === 1 || m.stato === 2 // Nuova o InCorso
      );
      this.activeMissionsSubject.next(activeMissions);
    }

    // Mantieni la selezione del personaggio corrente
    if (this.selectedCharacterSubject.value) {
      const currentSelectedId = this.selectedCharacterSubject.value.id;
      const updatedCharacter = gameState.allPersonaggi.find(p => p.id === currentSelectedId);
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

  getCurrentPartita(): ActualPartita | undefined {
    return this.gameStateSubject.value?.partitaAttuale;
  }

  getAllPersonaggi(): Personaggio[] {
    return this.gameStateSubject.value?.allPersonaggi || [];
  }

  getPersonaggiInPartita(): Personaggio[] {
    return this.gameStateSubject.value?.partitaAttuale?.personaggi || [];
  }

  getCombattimentiAttivi(): Combattimento[] {
    return this.gameStateSubject.value?.partitaAttuale?.combattimenti || [];
  }

  // Metodo per forzare un aggiornamento immediato
  forceUpdate(): Observable<Game> {
    return this.fetchGameUpdate();
  }

  // Cleanup
  stopPolling() {
    if (this.updatePolling) {
      this.updatePolling.unsubscribe();
    }
  }
}