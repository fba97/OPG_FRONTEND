import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Oggetto, TipoOggetto } from '../dto/game';
import { resolveOggettoImage } from '../shared/item-art';
import { SidebarMenuItem } from '../partita/components/left-sidebar/left-sidebar.component';
import { DIZIONARI_MENU, TORNA_ALLA_HOME } from '../shared/nav-menu';

type FiltroOggetto = 'tutti' | TipoOggetto;

@Component({
  selector: 'app-oggetti',
  templateUrl: './oggetti.component.html',
  styleUrls: ['./oggetti.component.css']
})
export class OggettiComponent implements OnInit {
  itemsList: Oggetto[] = [];
  currentFilter: FiltroOggetto = 'tutti';

  readonly TipoOggetto = TipoOggetto;

  menuItems: SidebarMenuItem[] = [TORNA_ALLA_HOME, ...DIZIONARI_MENU];

  constructor(private service: UserService) {}

  ngOnInit(): void {
    this.service.findAllOggetti().subscribe(response => {
      this.itemsList = response as Oggetto[];
    });
  }

  get filteredList(): Oggetto[] {
    if (this.currentFilter === 'tutti') {
      return this.itemsList;
    }
    return this.itemsList.filter(o => o.tipo === this.currentFilter);
  }

  resolveImage(o: Oggetto): string {
    return resolveOggettoImage(o.id);
  }
}
