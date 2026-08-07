import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { Personaggio } from '../dto/personaggio';
import { PartitaService, PartitaSalvataInfo } from '../partita.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  personaggiList: Array<Personaggio> = []

  constructor(private router: Router, private service: UserService, private partitaService: PartitaService) { }

  ngOnInit(): void {
    this.service.findAllHeroes().subscribe(response => {
      this.personaggiList = response as Array<Personaggio>;
    });
  }

  isSidebarVisible = true;

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  showStat = false;
  numPartite = 10;
  numVittorie = 6;
  numSconfitte = 4;
  showForm = false;

  listaSaga = ['Dressrosa'];

  nomePartita = '';
  creaPartitaErrore = '';

  creaPartita() {
    this.creaPartitaErrore = '';
    const idPersonaggi = this.personaggiList.filter(p => p.selected).map(p => p.id);

    if (idPersonaggi.length === 0) {
      this.creaPartitaErrore = 'Seleziona almeno un eroe.';
      return;
    }

    const nome = this.nomePartita?.trim() || `Partita ${new Date().toLocaleString()}`;

    this.partitaService.startGame(nome, 1, idPersonaggi).subscribe({
      next: () => this.router.navigateByUrl('/partita'),
      error: (err) => this.creaPartitaErrore = 'Errore nella creazione della partita: ' + this.messaggioErrore(err)
    });
  }

  private messaggioErrore(err: any): string {
    if (typeof err?.error === 'string' && err.error.length > 0) {
      return err.error;
    }
    return err?.message ?? String(err);
  }

  listaPartite: PartitaSalvataInfo[] = [];
  selectedPartitaId: number | null = null;
  caricaPartitaErrore = '';

  caricaPartita() {
    this.caricaPartitaErrore = '';
    this.partitaService.getPartiteSalvate().subscribe({
      next: (partite) => this.listaPartite = partite,
      error: (err) => this.caricaPartitaErrore = 'Errore nel recupero delle partite salvate: ' + this.messaggioErrore(err)
    });
  }

  confermaCaricamento() {
    if (this.selectedPartitaId == null) {
      this.caricaPartitaErrore = 'Seleziona una partita da caricare.';
      return;
    }
    this.partitaService.loadGame(this.selectedPartitaId).subscribe({
      next: () => this.router.navigateByUrl('/partita'),
      error: (err) => this.caricaPartitaErrore = 'Errore nel caricamento della partita: ' + this.messaggioErrore(err)
    });
  }

  eliminaPartita(idPartita: number) {
    this.caricaPartitaErrore = '';
    this.partitaService.eliminaPartita(idPartita).subscribe({
      next: () => {
        this.listaPartite = this.listaPartite.filter(p => p.idPartita !== idPartita);
        if (this.selectedPartitaId === idPartita) {
          this.selectedPartitaId = null;
        }
      },
      error: (err) => this.caricaPartitaErrore = 'Errore nell\'eliminazione della partita: ' + this.messaggioErrore(err)
    });
  }
}
