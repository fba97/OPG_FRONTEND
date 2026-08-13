import { OggettoInventario } from './game';

export interface Personaggio {
    id: number;
    nome: string;
    punti_Vita: number;  // Nome campo verificato dal vivo su GetUpdatePartitaSoft: il backend serializza "punti_Vita" (non puntiVita)
    attacco: number;
    difesa: number;
    descrizione: string;
    tipoPersonaggio: number;
    posizione: number;
    taglia: number;
    livello: number;
    esperienza: number;
    gittataAttacco: number;
    gittataOggetti: number;
    movimento: number;  // Salti punto-punto consentiti da UNA azione di Spostamento (vedi Personaggio.Movimento lato backend)
    soldi: number;
    skillSbloccate: number[];
    inventario: Inventario;
    stato: any;  // Se stato è un oggetto, potresti creare un'interfaccia specifica
    selected: boolean;  // Se serve per la UI
    imageUrl: string;
}

export interface Inventario {
    id: number;
    personaggioId: number | null;
    capacitaMassima: number;
    tipo: number;
    oggetti: OggettoInventario[];
}