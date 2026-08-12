import { Component } from '@angular/core';
import { DevilFruits } from '../dto/frutti';
import { SidebarMenuItem } from '../partita/components/left-sidebar/left-sidebar.component';
import { DIZIONARI_MENU, TORNA_ALLA_HOME } from '../shared/nav-menu';

@Component({
  selector: 'app-frutti',
  templateUrl: './frutti.component.html',
  styleUrls: ['./frutti.component.css']
})
export class FruttiComponent {

  menuItems: SidebarMenuItem[] = [TORNA_ALLA_HOME, ...DIZIONARI_MENU];

  fruitsList: Array<DevilFruits> = [
    { id: 0, nome: "Mera mera", descrizione: "descrizione del frutto mera mera", carta: "/assets/images/frutti/meramera.svg" },
    { id: 1, nome: "Gum gum", descrizione: "descrizione del frutto gum gum", carta: "/assets/images/frutti/gumgum.svg" },
    { id: 2, nome: "Hana hana", descrizione: "descrizione del frutto hana hana", carta: "/assets/images/frutti/hanahana.svg" },
    { id: 3, nome: "Ito ito", descrizione: "descrizione del frutto ito ito", carta: "/assets/images/frutti/itoito.svg" },
    { id: 4, nome: "Ope ope", descrizione: "descrizione del frutto ope ope", carta: "/assets/images/frutti/opeope.svg" },
  ];
}
