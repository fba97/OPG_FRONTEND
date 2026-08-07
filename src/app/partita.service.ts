import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PartitaSalvataInfo {
    idPartita: number;
    nome: string;
    dataUltimoSalvataggio: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class PartitaService {

    private readonly BASE_URL = 'https://localhost:7087/api/Partita';

    constructor(private client: HttpClient) { }

    startGame(nome: string, difficolta: number, idPersonaggi: number[]): Observable<Object> {
        let params = new HttpParams()
            .set('nome', nome)
            .set('difficolta', difficolta.toString());
        idPersonaggi.forEach(id => {
            params = params.append('idPersonaggi', id.toString());
        });
        return this.client.post(`${this.BASE_URL}/StartGame`, null, { params });
    }

    loadGame(idPartita: number): Observable<Object> {
        const params = new HttpParams().set('idPartita', idPartita.toString());
        return this.client.post(`${this.BASE_URL}/LoadGame`, null, { params });
    }

    getPartiteSalvate(): Observable<PartitaSalvataInfo[]> {
        return this.client.get<PartitaSalvataInfo[]>(`${this.BASE_URL}/GetPartiteSalvate`);
    }
}
