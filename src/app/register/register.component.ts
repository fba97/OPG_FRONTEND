import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../dto/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private router: Router) { }

  // , private service: UserService

  ngOnInit(): void {
    //RECUPERO I DATI DAL BACKEND

    // this.service.findAll().subscribe(response => {
    //   this.bossesList = response as Array<Boss>;
    // });
  }


  user: User = {
    nome: '',
    cognome: '',
    email: '',
    username: '',
    password: ''
  }


  onSubmit() {
    // Qui puoi inserire il codice per salvare l'utente nel database o per fare altre operazioni di registrazione
  }
}
