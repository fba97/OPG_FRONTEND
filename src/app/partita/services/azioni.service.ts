// src/app/partita/services/azioni.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttaccoResult, Missione, Skill } from '../../dto/game';
import { Personaggio } from '../../dto/personaggio';

@Injectable({
  providedIn: 'root'
})
export class AzioniService {
  private readonly BASE_URL = 'https://localhost:7087/api/Azioni';

  constructor(private http: HttpClient) {}

  // Muove il personaggio in turno verso il punto indicato (destinazione = id del Punto sulla mappa)
  muoviVersoPunto(destinazione: number): Observable<Missione> {
    return this.http.post<Missione>(`${this.BASE_URL}/CreaEseguiMissione`, null, {
      params: { destinazione: destinazione.toString() }
    });
  }

  // Termina il turno del personaggio attuale, anche se non ha usato tutte le azioni disponibili
  concludiTurno(): Observable<Object> {
    return this.http.post(`${this.BASE_URL}/ConcludiTurno`, null);
  }

  // Attacco 1v1: idAttaccato = difensore, idAttaccante = chi attacca. Crea/aggiorna il
  // Combattimento lato backend e restituisce i due personaggi con l'HP gia' aggiornato.
  attacca(idAttaccato: number, idAttaccante: number): Observable<AttaccoResult> {
    return this.http.post<AttaccoResult>(`${this.BASE_URL}/Attacco`, null, {
      params: { idAttaccato: idAttaccato.toString(), idAttaccante: idAttaccante.toString() }
    });
  }

  // Tenta la fuga dal combattimento attivo del personaggio in turno (nessun parametro: il
  // backend opera su ActualTurno.IdDelPersonaggioInTurno). Fallisce se non c'e' un combattimento
  // InCorso per quel personaggio, o se non c'e' una casella adiacente libera senza nemici.
  fuggi(): Observable<Object> {
    return this.http.post(`${this.BASE_URL}/Fuggi`, null);
  }

  // Usa un oggetto dall'inventario del personaggio in turno: applica il suo effetto
  // (es. MoltiplicatoreAttacco) e lo consuma. Fallisce se l'oggetto non e' nell'inventario.
  usaOggetto(idOggetto: number): Observable<Object> {
    return this.http.post(`${this.BASE_URL}/Usa`, null, {
      params: { idOggetto: idOggetto.toString() }
    });
  }

  // Vende un oggetto dell'inventario del personaggio in turno in cambio di berry (prezzo
  // placeholder lato server, non e' un'azione di turno). Lo consuma.
  vendiOggetto(idOggetto: number): Observable<Object> {
    return this.http.post(`${this.BASE_URL}/Vendi`, null, {
      params: { idOggetto: idOggetto.toString() }
    });
  }

  // Sposta un oggetto dall'inventario del personaggio in turno a quello di un compagno.
  // E' un'azione di turno vera e propria (passa da ActionManager, TipoAzione.Scambia).
  scambiaOggetto(idSorgente: number, idADestinazione: number, idOggetto: number): Observable<Object> {
    return this.http.post(`${this.BASE_URL}/Scambia`, null, {
      params: {
        idSorgente: idSorgente.toString(),
        idADestinazione: idADestinazione.toString(),
        idOggetto: idOggetto.toString()
      }
    });
  }

  // Equipaggia/disequipaggia un oggetto (click su un oggetto gia' equipaggiato lo toglie).
  // Non e' un'azione di turno, stesso trattamento di Vendi.
  equipaggiaOggetto(idOggetto: number): Observable<Object> {
    return this.http.post(`${this.BASE_URL}/Equipaggia`, null, {
      params: { idOggetto: idOggetto.toString() }
    });
  }

  // Raccoglie l'oggetto che si trova sulla posizione del personaggio in turno e lo sposta
  // nel suo inventario. Nessun parametro: il backend ricava sia il personaggio (dal turno)
  // sia l'oggetto (cercandolo nell'inventario Mappa a quella posizione). E' un'azione di
  // turno vera e propria (ActionManager, TipoAzione.Raccogli).
  raccogli(): Observable<Object> {
    return this.http.post(`${this.BASE_URL}/Raccogli`, null);
  }

  // Catalogo skill (statico lato backend, nessuna tabella DB).
  getSkillCatalog(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.BASE_URL}/Skill`);
  }

  // Sblocca una skill per il personaggio in turno spendendo Soldi. Fallisce se gia'
  // sbloccata, se la skill appartiene a un altro personaggio o se mancano i Soldi.
  sbloccaSkill(idSkill: number): Observable<Personaggio> {
    return this.http.post<Personaggio>(`${this.BASE_URL}/SbloccaSkill`, null, {
      params: { idSkill: idSkill.toString() }
    });
  }

  // Usa una skill gia' sbloccata contro un bersaglio: stesso risultato di un Attacco
  // (SkillHandler delega ad AttaccoHandler con un moltiplicatore temporaneo sull'Attacco).
  usaSkill(idSkill: number, idAttaccato: number): Observable<AttaccoResult> {
    return this.http.post<AttaccoResult>(`${this.BASE_URL}/UsaSkill`, null, {
      params: { idSkill: idSkill.toString(), idAttaccato: idAttaccato.toString() }
    });
  }
}
