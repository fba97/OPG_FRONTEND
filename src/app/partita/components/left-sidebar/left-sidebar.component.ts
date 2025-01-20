// src/app/partita/components/left-sidebar/left-sidebar.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.css']
})
export class LeftSidebarComponent implements OnInit {
  isOpen = true;

  menuItems = [
    { name: 'Mainpage', url: 'http://localhost:4200/mainpage' },
    { name: 'Login', url: 'http://localhost:4200/login' },
    { name: 'Register', url: 'http://localhost:4200/register' },
    { name: 'Eroi', url: 'http://localhost:4200/personaggi' },
    { name: 'Combattimento', url: 'http://localhost:4200/combattimento' }
  ];

  constructor() {}

  ngOnInit(): void {}

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  getIconForMenuItem(name: string): string {
    switch (name.toLowerCase()) {
      case 'mainpage':
        return 'home';
      case 'login':
        return 'login';
      case 'register':
        return 'person_add';
      case 'eroi':
        return 'people';
      case 'combattimento':
        return 'sports_kabaddi';
      default:
        return 'navigate_next';
    }
  }
}