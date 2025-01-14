import { Component, OnInit } from '@angular/core';
//import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { Probabilita } from '../dto/probabilita';

@Component({
  selector: 'app-probabilita',
  templateUrl: './probabilita.component.html',
  styleUrls: ['./probabilita.component.css']
})
export class ProbabilitaComponent implements OnInit {

  probabilitaList: Array<Probabilita> = [
    { id: 1, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/probabilita/coup_de_boo.svg" },
    { id: 2, nome: "Law", descrizione: "descrizione", carta: "/assets/images/probabilita/gladius.svg" },
    { id: 3, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/probabilita/brannew.svg" },
    { id: 4, nome: "Law", descrizione: "descrizione", carta: "/assets/images/probabilita/bastille.svg" },
    { id: 5, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/probabilita/lao_g.svg" },
    { id: 6, nome: "Law", descrizione: "descrizione", carta: "/assets/images/probabilita/urlo_effemminato.svg" },
    { id: 7, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/probabilita/orlumbus_killer_bowling.svg" },
    { id: 8, nome: "Law", descrizione: "descrizione", carta: "/assets/images/probabilita/hajrudin_dal_grosso_braccio.svg" },
    { id: 9, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/probabilita/rebecca.svg" },
    { id: 10, nome: "Law", descrizione: "descrizione", carta: "/assets/images/probabilita/chinjao_family.svg" },
    { id: 11, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/probabilita/violet_si_converte.svg" },
    { id: 12, nome: "Law", descrizione: "descrizione", carta: "/assets/images/probabilita/cavendish_hakuba.svg" },
    { id: 13, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/probabilita/tatabasco_per_usolando.svg" },
    { id: 14, nome: "Law", descrizione: "descrizione", carta: "/assets/images/probabilita/concerto_soul_king.svg" },
    { id: 15, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/probabilita/hack.svg" },
    { id: 16, nome: "Law", descrizione: "descrizione", carta: "/assets/images/probabilita/ucy.svg" }

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

  generaProbabilita() {
    const index = Math.floor(Math.random() * this.probabilitaList.length);
    const carta = this.probabilitaList[index];
    window.location.href = 'http://localhost:4200' + carta.carta;

    //rimuovo la carta scelta dalla lista
    this.probabilitaList.splice(index, 1)
    //DA SISTEMARE,SE SI RICARICA LA PAGINA LA LISTA SI RIEMPIE DI NUOVO
  }

}
