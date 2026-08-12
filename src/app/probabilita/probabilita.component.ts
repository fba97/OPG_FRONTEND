import { Component } from '@angular/core';
import { Probabilita } from '../dto/probabilita';
import { SidebarMenuItem } from '../partita/components/left-sidebar/left-sidebar.component';
import { DIZIONARI_MENU, TORNA_ALLA_HOME } from '../shared/nav-menu';

@Component({
  selector: 'app-probabilita',
  templateUrl: './probabilita.component.html',
  styleUrls: ['./probabilita.component.css']
})
export class ProbabilitaComponent {

  menuItems: SidebarMenuItem[] = [TORNA_ALLA_HOME, ...DIZIONARI_MENU];

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
  ];

  // Carta appena pescata, mostrata dentro l'app (prima "Genera" faceva window.location.href
  // verso il file SVG grezzo, uscendo dalla SPA — bug UX a parte dal collegamento mappa).
  cartaEstratta: Probabilita | null = null;

  generaProbabilita() {
    if (!this.probabilitaList.length) {
      return;
    }
    const index = Math.floor(Math.random() * this.probabilitaList.length);
    this.cartaEstratta = this.probabilitaList[index];
  }
}
