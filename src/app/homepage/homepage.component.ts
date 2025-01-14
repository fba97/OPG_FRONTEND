import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { Personaggio } from '../dto/personaggio';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  personaggiList: Array<Personaggio> = []

  constructor(private router: Router, private service: UserService) { }

  // , private service: UserService

  ngOnInit(): void {
    //RECUPERO I DATI DAL BACKEND

    this.service.findAllHeroes().subscribe(response => {
      this.personaggiList = response as Array<Personaggio>;
      for (let i = 0; 1 < 7; i++) {
        if (this.personaggiList[i].id > 5) {
          this.personaggiList.splice(this.personaggiList[i].id, 2)
        }
      }
    });


  }

  isSidebarVisible = true;

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  showStat = false;
  numPartite = 10;
  numVittorie = 6;
  numSconfitte = 4;
  showForm = false;

  listaSaga = ['Dressrosa'];
  showPartite = false;
  listaPartite = ['Partita1', 'Partita2', 'Partita3'];

  mostraForm() {

  }

  caricaPartita() {

  }


}
