import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { Personaggio } from '../dto/personaggio';

@Component({
  selector: 'app-personaggi',
  templateUrl: './personaggi.component.html',
  styleUrls: ['./personaggi.component.css']
})
export class PersonaggiComponent implements OnInit {

  heroesList = new Array<Personaggio>

  // playersList: Array<Player> = [
  //   { id: 1, nome: "Usopp", carta: "/assets/images/personaggi/usopp.svg" },
  //   { id: 2, nome: "Law", carta: "/assets/images/personaggi/law.svg" }
  // ]

  constructor(private router: Router, private service: UserService) { }

  // 

  ngOnInit(): void {
    //RECUPERO I DATI DAL BACKEND

    this.service.findAllHeroes().subscribe(response => {
      this.heroesList = response as Array<Personaggio>;
    });
  }

  informazioni(id: Number) {
    //this.router.navigateByUrl('/dettaglio/' + id);
  }

}
