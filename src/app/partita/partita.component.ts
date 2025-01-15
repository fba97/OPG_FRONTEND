import { Component, OnInit} from '@angular/core';
import { UserService } from '../user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-partita',
  templateUrl: './partita.component.html',
  styleUrls: ['./partita.component.css']
})
export class PartitaComponent implements OnInit {

  isSidebarVisible = true;

  menuItems = [
    { name: 'Mainpage', url: 'http://localhost:4200/mainpage' },
    { name: 'Login', url: 'http://localhost:4200/login' },
    { name: 'Register', url: 'http://localhost:4200/register' },
    { name: 'Eroi', url: 'http://localhost:4200/personaggi' },
    { name: 'Combattimento', url: 'http://localhost:4200/combattimento' }
  ];

  constructor(private service: UserService, private modalService: NgbModal) {}

  ngOnInit(): void {}

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }


}
