import { Component } from '@angular/core';
import { Imprevisti } from '../dto/imprevisti';
import { SidebarMenuItem } from '../partita/components/left-sidebar/left-sidebar.component';
import { DIZIONARI_MENU, TORNA_ALLA_HOME } from '../shared/nav-menu';

@Component({
  selector: 'app-imprevisti',
  templateUrl: './imprevisti.component.html',
  styleUrls: ['./imprevisti.component.css']
})
export class ImprevistiComponent {

  menuItems: SidebarMenuItem[] = [TORNA_ALLA_HOME, ...DIZIONARI_MENU];

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
  ];

  // Carta appena pescata, mostrata dentro l'app (prima "Genera" faceva window.location.href
  // verso il file SVG grezzo, uscendo dalla SPA — bug UX a parte dal collegamento mappa).
  cartaEstratta: Imprevisti | null = null;

  generaImprevisto() {
    if (!this.imprevistiList.length) {
      return;
    }
    const index = Math.floor(Math.random() * this.imprevistiList.length);
    this.cartaEstratta = this.imprevistiList[index];
  }
}
