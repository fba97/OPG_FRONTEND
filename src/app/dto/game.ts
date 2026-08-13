import { Personaggio } from "./personaggio";

// src/app/dto/types.ts
export enum StatoMissione {
    Nuova = 1,
    InCorso = 2,
    Completata = 3,
    Interrotta = 4,
    Errore = 9
}

export enum StatoPasso {
    Nuovo = 1,
    InCorso = 2,
    Completato = 3,
    Errore = 9
}

export enum TipoMissione {
    Spostamento = 1
}

export enum TipoPersonaggio {
    AmicoPersonaggio = 1,
    AmicoNPC = 2,
    NemicoPersonaggio = 3,
    NemicoNPC = 4
}

// src/app/dto/interfaces.ts
export interface Stato {
    id: number;
    nome: string;
    descrizione: string;
    effetto: string;
    durataTurni: number;
}

export interface Adiacenza {
    id: number;
    idPuntoUno: number;
    idPuntoDue: number;
    bidirezionale: boolean;
    abilitata: boolean;
}

export interface Area {
    id: number;
    id_Mappa: number;
    descrizione: string;
    tessere: Tessera[];
}

export interface Tessera {
    id: number;
    id_Area: number;
    descrizione: string;
    tipo: string;
    configurazione: boolean;
    punti: Punto[];
}

export interface Punto {
    id: number;
    id_Tessera: number;
    descrizione: string;
    capienza: number;
    blocco: boolean;
}

export interface Mappa {
    id: number;
    descrizione: string;
    aree: Area[];
}





export enum TipoOggetto {
    Generico = 1,
    Probabilita = 2,
    Imprevisto = 3
}
export enum StatoOggetto {
    Nuovo = 1,
    Usato = 2,
    Attivato = 3, //questo per effetti continui ad attivazione singola
    Equipaggiato = 4 // questo è per gli oggetti che hanno bonus che si usano solo su determinate condizioni
}
export enum TipoInventario {
    Personaggio = 1,
    Mappa = 2,
    Negozio = 3
}
  
export interface Oggetto {
    id: number;
    nome: string;
    descrizione: string;
    tipo: TipoOggetto;
    stato: StatoOggetto;
    
    bonusAttacco: number;
    bonusDifesa: number;
    id_Posizione?: number | null; // nome campo verificato dal vivo: il backend serializza "id_Posizione" (non idPosizione)
    idInventario?: number | null;
    effetto: EffettoOggetto;
  }

  export interface EffettoOggetto {
    nome: string;
    descrizione: string;
  }

export interface OggettoInventario {
    oggetto: Oggetto;
    quantita: number;
    isEquipaggiato: boolean;
}

export interface Inventario {
  id: number;
  personaggioId: number | null; // Null per inventari non legati a personaggi (es. casse)
  capacitaMassima: number;
  tipo: TipoInventario;
  oggetti: OggettoInventario[];
}







export enum StatoCombattimento {
    InCorso = 1,
    Concluso = 2,
    Fuggito = 3
}

export interface Combattimento {
    id: number;
    nome: string;
    listaEroi: number[];
    listaNPCs: number[];
    stato: StatoCombattimento;
    log: string[];  // Cronaca colpo per colpo (Combattimento.Log lato backend): l'unico modo di sapere cosa hanno fatto i nemici nel loro turno
}

// Risposta di POST api/Azioni/Attacco: e' l'oggetto Attacco lato backend serializzato cosi'
// com'e' (non un DTO di risultato dedicato) — contiene i due personaggi con l'HP gia' aggiornato.
export interface AttaccoResult {
    personaggio: Personaggio;
    difensore: Personaggio;
}

// Mappa Primitives/EventoMappa.cs — punto della mappa assegnato come trigger
// Probabilita'/Imprevisto (tipo riusa TipoOggetto.Probabilita=2/Imprevisto=3).
export interface EventoMappa {
    idPunto: number;
    tipo: TipoOggetto;
}

// Mappa Primitives/Skill.cs — catalogo hardcoded lato backend (nessuna tabella DB).
export interface Skill {
    id: number;
    nome: string;
    descrizione: string;
    costo: number;
    proprietario: number | null; // enum PersonaggioBase, null = chiunque puo' sbloccarla
    moltiplicatoreDanno: number;
}

// Mappa la classe backend Primitives/Turno.cs, serializzata dentro ActualPartita.ActualTurno
export interface Turno {
    personaggiIds: number[];
    idDelPersonaggioInTurno: number;
    turnoCorrente: number;
    giocoIniziato: boolean;
    azioniMassimePerTurno: number;
    azioniRimanenti: number;
}

export interface Passo {
    id: number;
    sorgente: number;
    destinazione: number;
    missione?: Missione;
    stato: StatoPasso;
}

export interface Missione {
    id: number;
    personaggio: Personaggio;
    tipoMissione: TipoMissione;
    partenza: number;
    destinazione: number;
    stato: StatoMissione;
    passi: Passo[];
}

export interface ActualPartita {
    id: number;
    nome: string;
    idGiocatore: number;
    idObiettivo: number;
    difficolta: number;
    statoPartita: number;
    dataInizioPartita?: Date;
    dataUltimoSalvataggio?: Date;
    dataFinePartita?: Date;
    jsonSalvataggio: string;
    mappa?: Mappa;
    aree: Area[];
    tessere: Tessera[];
    punti: Punto[];
    personaggi: Personaggio[];
    oggetti: Oggetto[];
    adiacenze: Adiacenza[];
    inventari: Inventario[];
    combattimenti: Combattimento[];
    missioni: Missione[];
    actualTurno?: Turno;
}

export interface Game {
    partitaAttuale?: ActualPartita;
    allMappe?: Mappa;
    allAree: Area[];
    allTessere: Tessera[];
    allPunti: Punto[];
    allAdiacenze: Adiacenza[];
    allPersonaggi: Personaggio[];
    allOggetti: Oggetto[];
}

export interface PartitaSoft {
    id: number;
    difficolta: number;
    dataInizioPartita?: Date;
    dataFinePartita?: Date;
    dataUltimoSalvataggio?: Date;
    idObiettivo: number;
    inventari: Inventario[];
    idGiocatore: number;
    nome: string;
    oggetti: Oggetto[];
    personaggi: Personaggio[];
    statoPartita: number;
    combattimenti: Combattimento[];
    missioni: Missione[];
    punti: Punto[];
    aree: Area[];
    tessere: Tessera[];
    eventiMappa: EventoMappa[];
    actualTurno?: Turno;
}
