import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Personaggio } from '../dto/personaggio';

@Component({
  selector: 'app-combattimento',
  templateUrl: './combattimento.component.html',
  styleUrls: ['./combattimento.component.css']
})
export class CombattimentoComponent implements OnInit {

  heroesList: Array<Personaggio> = []

  bossList: Array<Personaggio> = []

  constructor(private router: Router, private route: ActivatedRoute, private service: UserService) { }

  ngOnInit(): void {

    this.service.findAllHeroes().subscribe(response => {
      this.heroesList = response as Array<Personaggio>;
    });
  }

  generaCombattimento() {
    // genera l'URL con i parametri di query
    const url = '/dettagliocombattimento?eroi=' + this.selectedHeroIds.join(',') + '&boss=' + this.selectedBossIds.join(',');
    // naviga alla pagina dettagliocombattimento con i parametri di query
    this.router.navigateByUrl(url);
  }


  //qua esegue il controllo se selezioni più volte lo stesso personaggio
  selectedHeroIds: number[] = [];
  heroSelectionError: boolean = true;
  selectedBossIds: number[] = [];
  bossSelectionError: boolean = true;

  // Aggiungiamo un nuovo array per salvare gli id degli eroi selezionati che dovranno essere esclusi dagli altri menu a tendina
  excludedHeroIds: number[] = [];
  excludedBossIds: number[] = [];


  onHeroSelected(event: any) {
    const heroId = Number(event.target.value);
    if (this.selectedHeroIds.includes(heroId)) {
      this.heroSelectionError = true;
    } else {
      this.selectedHeroIds.push(heroId);
      this.heroSelectionError = false;
      // Aggiungiamo l'id del personaggio selezionato all'array degli id da escludere dagli altri menu a tendina
      this.excludedHeroIds.push(heroId);
      // Rimuoviamo l'id del personaggio selezionato dagli altri menu a tendina
      //this.playersList = this.playersList.filter(hero => !this.excludedHeroIds.includes(hero.id));
    }
  }

  onBossSelected(event: any) {
    const bossId = Number(event.target.value);
    if (this.selectedBossIds.includes(bossId)) {
      this.bossSelectionError = true;
    } else {
      this.selectedBossIds.push(bossId);
      this.bossSelectionError = false;
      // Rimuoviamo l'id del boss selezionato dagli altri menu a tendina
      //this.bossList = this.bossList.filter(boss => !this.excludedBossIds.includes(boss.id));
    }
  }

  // Aggiorniamo la funzione isHeroSelected per verificare sia tra gli eroi selezionati che tra quelli da escludere
  isHeroSelected(heroId: number) {
    return this.selectedHeroIds.includes(heroId) || this.excludedHeroIds.includes(heroId);
  }
  isBossSelected(bossId: number) {
    return this.selectedBossIds.includes(bossId) || this.excludedBossIds.includes(bossId);
  }

}


