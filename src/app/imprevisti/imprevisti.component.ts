import { Component, OnInit } from '@angular/core';
//import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { Imprevisti } from '../dto/imprevisti';

@Component({
  selector: 'app-imprevisti',
  templateUrl: './imprevisti.component.html',
  styleUrls: ['./imprevisti.component.css']
})
export class ImprevistiComponent implements OnInit {

  imprevistiList: Array<Imprevisti> = [
    { id: 1, nome: "Cos'è quello??", descrizione: "descrizione", carta: "/assets/images/imprevisti/cos'è_quello.svg" },
    { id: 2, nome: "Un nome, una condanna", descrizione: "descrizione", carta: "/assets/images/imprevisti/unnome_unacondanna.svg" },
    { id: 3, nome: "Trueno bastard", descrizione: "descrizione", carta: "/assets/images/imprevisti/trueno_bastard.svg" },
    { id: 4, nome: "Donquixote family", descrizione: "descrizione", carta: "/assets/images/imprevisti/donquixote_family.svg" },
    { id: 5, nome: "Buster call", descrizione: "descrizione", carta: "/assets/images/imprevisti/buster_call.svg" },
    { id: 6, nome: "Coup de burst", descrizione: "descrizione", carta: "/assets/images/imprevisti/coup_de_burst.svg" },
    { id: 7, nome: "King Punch", descrizione: "descrizione", carta: "/assets/images/imprevisti/king_punch.svg" },
    { id: 8, nome: "Ira di Burgess", descrizione: "descrizione", carta: "/assets/images/imprevisti/ira_di_burgess.svg" },
    { id: 9, nome: "Sabo: Artiglio di Drago", descrizione: "descrizione", carta: "/assets/images/imprevisti/sabo_artigliodidrago.svg" },
    { id: 10, nome: "Sorriso amaro", descrizione: "descrizione", carta: "/assets/images/imprevisti/sorriso_amaro.svg" },

  ]

  constructor(private router: Router) { }

  // , private service: UserService

  ngOnInit(): void {

    // this.service.findAll().subscribe(response => {
    //   this.playersList = response as Array<Player>;
    // });
  }

  utilizza(id: Number) {
    //this.router.navigateByUrl('/dettaglio/' + id);
  }

  generaImprevisto() {
    const index = Math.floor(Math.random() * this.imprevistiList.length);
    const carta = this.imprevistiList[index];
    //dopo aver scelto casualmente una carta, redirect alla carta scelta
    window.location.href = 'http://localhost:4200' + carta.carta;

    //rimuovo la carta scelta dalla lista
    this.imprevistiList.splice(index, 1)
    //DA SISTEMARE,SE SI RICARICA LA PAGINA LA LISTA SI RIEMPIE DI NUOVO
  }

}
