import { Component, OnInit } from '@angular/core';
//import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { DevilFruits } from '../dto/frutti';

@Component({
  selector: 'app-frutti',
  templateUrl: './frutti.component.html',
  styleUrls: ['./frutti.component.css']
})
export class FruttiComponent implements OnInit {

  fruitsList: Array<DevilFruits> = [
    { id: 0, nome: "Mera mera", descrizione: "descrizione del frutto mera mera", carta: "/assets/images/frutti/meramera.svg" },
    { id: 1, nome: "Gum gum", descrizione: "descrizione del frutto gum gum", carta: "/assets/images/frutti/gumgum.svg" },
    { id: 2, nome: "Hana hana", descrizione: "descrizione del frutto hana hana", carta: "/assets/images/frutti/hanahana.svg" },
    { id: 3, nome: "Ito ito", descrizione: "descrizione del frutto ito ito", carta: "/assets/images/frutti/itoito.svg" },
    { id: 4, nome: "Ope ope", descrizione: "descrizione del frutto ope ope", carta: "/assets/images/frutti/opeope.svg" },
  ]

  constructor(private router: Router) { }

  // , private service: UserService

  ngOnInit(): void {
    //RECUPERO I DATI DAL BACKEND

    // this.service.findAll().subscribe(response => {
    //   this.playersList = response as Array<Player>;
    // });
  }

  effetto(id: number) {
    alert("Descrizione: " + this.fruitsList[id].descrizione)
    //this.router.navigateByUrl('/dettaglio/' + id);
  }

}
