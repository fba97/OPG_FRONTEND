// src/app/partita/services/azioni.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AzioniService {
  private readonly BASE_URL = 'https://localhost:7087/api/Azioni';

  constructor(private http: HttpClient) {}

  // Muove il personaggio in turno verso il punto indicato (destinazione = id del Punto sulla mappa)
  muoviVersoPunto(destinazione: number): Observable<Object> {
    return this.http.post(`${this.BASE_URL}/CreaEseguiMissione`, null, {
      params: { destinazione: destinazione.toString() }
    });
  }

  // Termina il turno del personaggio attuale, anche se non ha usato tutte le azioni disponibili
  concludiTurno(): Observable<Object> {
    return this.http.post(`${this.BASE_URL}/ConcludiTurno`, null);
  }
}
