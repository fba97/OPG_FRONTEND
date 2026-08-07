export interface Personaggio {
    id: number;
    nome: string;
    puntiVita: number;  // Cambiato per corrispondere a "punti_Vita" dell'API
    attacco: number;
    difesa: number;
    descrizione: string;
    tipoPersonaggio: number;
    posizione: number;
    taglia: number;
    livello: number;
    gittataAttacco: number;
    gittataOggetti: number;
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
    oggetti: any[];  // Se gli oggetti hanno una struttura specifica, puoi definire un'interfaccia Oggetto
}