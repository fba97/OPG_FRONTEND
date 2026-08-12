// src/app/partita/components/left-sidebar/left-sidebar.component.ts
import { Component, Input, OnInit } from '@angular/core';

export interface SidebarMenuItem {
  name: string;
  route: string;
}

@Component({
  selector: 'app-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.css']
})
export class LeftSidebarComponent implements OnInit {
  @Input() menuItems: SidebarMenuItem[] = [];

  isOpen = true;

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
      case 'oggetti':
        return 'inventory_2';
      case 'frutti':
        return 'egg';
      case 'probabilità':
        return 'casino';
      case 'imprevisti':
        return 'help';
      case 'torna alla home':
      case 'torna alla partita':
        return 'sailing';
      default:
        return 'navigate_next';
    }
  }
}
