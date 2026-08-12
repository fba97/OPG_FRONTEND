import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Personaggio } from '../dto/personaggio';
import { TipoPersonaggio } from '../dto/game';
import { resolvePersonaggioImage } from '../shared/character-portrait';
import { SidebarMenuItem } from '../partita/components/left-sidebar/left-sidebar.component';
import { DIZIONARI_MENU, TORNA_ALLA_HOME } from '../shared/nav-menu';

type FiltroPersonaggio = 'tutti' | 'eroi' | 'nemici';

@Component({
  selector: 'app-personaggi',
  templateUrl: './personaggi.component.html',
  styleUrls: ['./personaggi.component.css']
})
export class PersonaggiComponent implements OnInit {
  heroesList: Personaggio[] = [];
  currentFilter: FiltroPersonaggio = 'tutti';

  menuItems: SidebarMenuItem[] = [TORNA_ALLA_HOME, ...DIZIONARI_MENU];

  constructor(private service: UserService) {}

  ngOnInit(): void {
    this.service.findAllHeroes().subscribe(response => {
      this.heroesList = response as Personaggio[];
    });
  }

  private isNemico(p: Personaggio): boolean {
    return p.tipoPersonaggio === TipoPersonaggio.NemicoPersonaggio || p.tipoPersonaggio === TipoPersonaggio.NemicoNPC;
  }

  get filteredList(): Personaggio[] {
    if (this.currentFilter === 'eroi') {
      return this.heroesList.filter(p => !this.isNemico(p));
    }
    if (this.currentFilter === 'nemici') {
      return this.heroesList.filter(p => this.isNemico(p));
    }
    return this.heroesList;
  }

  resolveImage(p: Personaggio): string {
    return resolvePersonaggioImage(p);
  }

  isCardNemico(p: Personaggio): boolean {
    return this.isNemico(p);
  }
}
