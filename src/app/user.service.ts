import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Personaggio } from './dto/personaggio';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    userList: Array<Personaggio> = new Array();

    constructor(private client: HttpClient) {

        console.log('creato servizio');

    }

    findAllHeroes(): Observable<Object> {

        return this.client.get('https://localhost:7087/api/Personaggio/GetAllPersonaggiBase');
    }

    findAllCombattimentiattivi(): Observable<Object> {

        return this.client.get('https://localhost:7087/api/Combattimento/GetAllCombattimenti');
    }

    saveHeroesdata(heroData: any): Observable<Object> {
        return this.client.post('https://localhost:7087/api/Personaggio/GetAllPersonaggiBase', heroData);
    }

    saveBossesdata(bossData: any): Observable<Object> {
        return this.client.post('https://localhost:64230/Boss', bossData);
    }

    saveCombattimentodata(combattimentoData: any): Observable<Object> {
        return this.client.post('https://localhost:64230/Combattimentiattivi', combattimentoData);
    }

    // findAllItems(): Observable<Object> {

    //     // costruire la comunicazione con il server
    //     // usare HttpClient per il richiamo del servizio
    //     return this.client.get('http://localhost:9080/items');
    // }

    // findAllDevilFruits(): Observable<Object> {

    //     // costruire la comunicazione con il server
    //     // usare HttpClient per il richiamo del servizio
    //     return this.client.get('http://localhost:9080/devilfruits');
    // }

    // findAllBosses(): Observable<Object> {

    //     // costruire la comunicazione con il server
    //     // usare HttpClient per il richiamo del servizio
    //     return this.client.get('http://localhost:9080/bosses');
    // }

    // find(id: Number): Observable<Player> {

    //     return this.client.get<Player>('https://localhost:64230/Personaggio/' + id);
    // }
}


