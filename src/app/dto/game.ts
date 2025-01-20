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

export interface Personaggio {
    id: number;
    nome: string;
    punti_Vita: number;
    attacco: number;
    difesa: number;
    descrizione: string;
    tipoPersonaggio: TipoPersonaggio;
    posizione: number;
    taglia: number;
    livello: number;
    inventario: Inventario;
    stato?: Stato;
}

export interface Oggetto {
    id: number;
    nome: string;
    descrizione: string;
    tipo: number;
    bonusAttacco: number;
    bonusDifesa: number;
    id_Posizione?: number;
    id_Inventario?: number;
}

export interface Inventario {
    id: number;
    listaIdOggetti: Oggetto[];
}

export interface Combattimento {
    id: number;
    nome: string;
    listaEroi: number[];
    listaNPCs: number[];
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