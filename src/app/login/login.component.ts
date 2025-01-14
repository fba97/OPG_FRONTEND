import { Component, OnInit } from '@angular/core';
//import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router) { }

  // , private service: UserService

  ngOnInit(): void {
    //RECUPERO I DATI DAL BACKEND

    // this.service.findAll().subscribe(response => {
    //   this.bossesList = response as Array<Boss>;
    // });
  }

  validate() {
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    if (username === 'admin' && password === 'admin') {
      window.location.href = 'http://localhost:4200/homepage';
    } else {
      alert('Username o password non validi.');
    }
  }


}
