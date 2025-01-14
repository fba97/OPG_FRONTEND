import { Component, OnInit } from '@angular/core';
//import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-combattimento',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css']
})
export class MainpageComponent implements OnInit {

  constructor(private router: Router) { }

  // , private service: UserService

  ngOnInit(): void {
    //RECUPERO I DATI DAL BACKEND

    // this.service.findAll().subscribe(response => {
    //   this.bossesList = response as Array<Boss>;
    // });
  }

}
