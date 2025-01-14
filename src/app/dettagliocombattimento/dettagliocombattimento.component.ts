import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { CombattimentoService } from '../combattimento.service';

import { Router, ActivatedRoute } from '@angular/router';
import { Personaggio } from '../dto/personaggio';
import { Combattimento } from '../dto/combattimento';


@Component({
  selector: 'app-dettagliocombattimento',
  templateUrl: './dettagliocombattimento.component.html',
  styleUrls: ['./dettagliocombattimento.component.css']
})
export class DettagliocombattimentoComponent implements OnInit {

  heroesList: Array<Personaggio> = []

  bossList: Array<Personaggio> = []

  personaggiList: Array<Personaggio> = []


  heroIds: number[] = []
  bossIds: number[] = []

  selectedHeroes: Personaggio[] = []
  selectedBosses: Personaggio[] = []
  datiCombattimento: Combattimento = { id: 0, nome: '', listaNPCs: [], listaEroi: [] }
  bossesNames: string[] = []

  constructor(private route: ActivatedRoute, private router: Router, private service: UserService, private combattimentoService: CombattimentoService) { }

  ngOnInit(): void {
    //recupero tutti i giocatori
    this.service.findAllHeroes().subscribe(response => {
      this.personaggiList = response as Array<Personaggio>;


      for (let i = 0; i <= 7; i++) {
        if (this.personaggiList[i].id <= 6) {
          this.heroesList.push(this.personaggiList[i])
        } else {
          this.bossList.push(this.personaggiList[i])
        }
      }

      console.log(this.heroesList)
      console.log(this.bossList)

      // Recupera gli id dalla query e li mette nelle due liste heroIds e bossIds
      this.heroIds = this.route.snapshot.queryParamMap.get('eroi')?.split(',').map(id => parseInt(id)) || [];
      this.bossIds = this.route.snapshot.queryParamMap.get('boss')?.split(',').map(id => parseInt(id)) || [];

      //dagli id risalgo alla lista degli eroi e dei boss
      this.selectedHeroes = this.heroIds.map(id => this.combattimentoService.getHeroById(id, this.heroesList))
      this.selectedBosses = this.bossIds.map(id => this.combattimentoService.getBossById(id, this.bossList))


      // //registro gli id di eroi e boss nei dati del combattimento per salvarli nel db dei combattimenti attivi

      // for (let i = 0; i < this.heroIds.length; i++) {

      //   this.datiCombattimento.listaHeroesIds.push(this.heroIds[i])
      // }

      // for (let i = 0; i < this.bossIds.length; i++) {

      //   this.datiCombattimento.listaBossesIds.push(this.bossIds[i])
      // }


      // //salvo i nomi dei boss che devo stampare nel nome del combattimento
      // for (let i = 0; i < this.selectedBosses.length; i++) {
      //   this.bossesNames.push(this.selectedBosses[i].nome)
      // }

      // this.datiCombattimento.nome = "Combattimento vs " + this.bossesNames


      // //mando i dati del combattimento al db
      // this.service.saveCombattimentodata(this.datiCombattimento).subscribe((response) => {
      //   console.log('Dati del combattimento aggiunti con successo', response);
      // }, (error) => {
      //   console.error('Si è verificato un errore durante la aggiunta dei dati del combattimento', error);
      // });

    });
  }

  attacco(idAttaccato: any, idAttaccante: any) {
    this.combattimentoService.combattimento(idAttaccato, idAttaccante)
  }

  riceviAttacco(idAttaccato: any, idAttaccante: any) {
    this.combattimentoService.combattimento(idAttaccato, idAttaccante)

  }

}

