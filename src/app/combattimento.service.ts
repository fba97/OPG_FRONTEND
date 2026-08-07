import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Personaggio } from './dto/personaggio';
import { Combattimento } from './dto/combattimento';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class CombattimentoService {

    combattimentiList: Array<Combattimento> = new Array();

    constructor(private client: HttpClient) {

        console.log('creato servizio');

    }

    combattimento(idAttaccato: any, idAttaccante: any): Observable<Object> {
        // Il model binding di ASP.NET Core per parametri semplici su una POST li legge dalla query string
        return this.client.post(`https://localhost:7087/api/Combattimento/PostAttacco?idAttaccato=${idAttaccato}&idAttaccante=${idAttaccante}`, null);
    }

    //recupera l'oggetto player dalla lista tramite l'id 
    getHeroById(id: number, list: Array<Personaggio>): Personaggio {
        const player = list.find(p => p.id === id);
        if (player) {
            return player;
        } else {
            return { id: 0, nome: '', descrizione: '', attacco: 0, difesa: 0, puntiVitaMassimi: 0, selected: false };
        }
    }

    //recupera l'oggetto boss dalla lista tramite l'id 

    getBossById(id: number, list: Array<Personaggio>): Personaggio {
        const player = list.find(p => p.id === id);
        if (player) {
            return player;
        } else {
            return { id: 0, nome: '', puntiVitaMassimi: 0, attacco: 0, difesa: 0, descrizione: '', selected: false };
        }
    }
}


