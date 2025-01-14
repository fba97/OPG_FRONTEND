import { Component, OnInit } from '@angular/core';
//import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { Item } from '../dto/item';

@Component({
  selector: 'app-oggetti',
  templateUrl: './oggetti.component.html',
  styleUrls: ['./oggetti.component.css']
})
export class OggettiComponent implements OnInit {

  itemsList: Array<Item> = [
    { id: 1, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/baffotti.svg" },
    { id: 2, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/barbotta.svg" },
    { id: 3, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/cappello_di_koala.svg" },
    { id: 4, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/muco_di_trebol.svg" },
    { id: 5, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/nami_maglietta_bagnata.svg" },
    { id: 6, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/sasso_grande.svg" },
    { id: 7, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/armatura_a_scaglie_rosa_di_momonosuke.svg" },
    { id: 8, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/attacco_speciale_a_lungo_raggio_bagworm.svg" },
    { id: 9, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/trivella_di_shinjao.svg" },
    { id: 10, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/spada_di_suleiman.svg" },
    { id: 11, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/pelliccia_di_bepo.svg" },
    { id: 12, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/barriera_di_bartolomeo.svg" },
    { id: 13, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/fratelli_funk.svg" },
    { id: 14, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/bende.svg" },
    { id: 15, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/mummy.svg" },
    { id: 16, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/steroidi_energetici.svg" },
    { id: 17, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/manicaretti_di_sanji.svg" },
    { id: 18, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/fungo velenoso.svg" },
    { id: 19, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/ricordo_di_corazon.svg" },
    { id: 20, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/poneglyph.svg" },
    { id: 21, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/pugnale_della_cornuta.svg" },
    { id: 22, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/cappello_di_paglia.svg" },
    { id: 23, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/shusui.svg" },
    { id: 24, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/jean_ango.svg" },
    { id: 25, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/damask.svg" },
    { id: 26, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/ideo.svg" },
    { id: 27, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/urlo_di_gats.svg" },
    { id: 28, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/tubo_di_ferro_di_sabo.svg" },
    { id: 29, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/bende.svg" },
    { id: 30, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/manicaretti_di_sanji.svg" },
    { id: 31, nome: "Law", descrizione: "descrizione", carta: '/assets/images/oggetti/manicaretti_di_sanji.svg' },
    { id: 32, nome: "Law", descrizione: "descrizione", carta: "/assets/images/oggetti/cp0.svg" },

  ]


  constructor(private router: Router) {
  }

  // , private service: UserService

  ngOnInit(): void {

    // this.service.findAll().subscribe(response => {
    //   this.playersList = response as Array<Player>;
    // });


  }


  utilizza(id: Number) {
    //this.router.navigateByUrl('/dettaglio/' + id);
  }

  generaOggetti() {
    const index = Math.floor(Math.random() * this.itemsList.length);
    const carta = this.itemsList[index];
    window.location.href = 'http://localhost:4200' + carta.carta;

    //rimuovo la carta scelta dalla lista
    this.itemsList.splice(index, 1)
    //DA SISTEMARE,SE SI RICARICA LA PAGINA LA LISTA SI RIEMPIE DI NUOVO
  }

}
