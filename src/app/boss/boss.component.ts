import { Component, OnInit } from '@angular/core';
//import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { Personaggio } from '../dto/personaggio';

@Component({
  selector: 'app-combattimento',
  templateUrl: './boss.component.html',
  styleUrls: ['./boss.component.css']
})
export class BossComponent implements OnInit {

  bossesList: Array<Personaggio> = []

  constructor(private router: Router) { }

  // , private service: UserService

  ngOnInit(): void {
    //RECUPERO I DATI DAL BACKEND

    // this.service.findAll().subscribe(response => {
    //   this.bossesList = response as Array<Boss>;
    // });
  }

  attacca(id: Number) {
    //this.router.navigateByUrl('/dettaglio/' + id);
  }

}
