import { Component } from '@angular/core';

interface Character {
  name: string;
  health: number;
  maxHealth: number;
  defense: number;
  attack: number;
  imageUrl: string;
}

interface Section {
  id: string;
  label: string;
  icon: string;
}

interface InventoryItem {
  name: string;
  icon: string;
}

interface Skill {
  name: string;
  icon: string;
  cost: number;
  unlocked: boolean;
}

@Component({
  selector: 'app-character-actions',
  templateUrl: './character-actions.component.html',
  styleUrls: ['./character-actions.component.css']
})
export class CharacterActionsComponent {
  character: Character = {
    name: 'Hero',
    health: 80,
    maxHealth: 100,
    defense: 10,
    attack: 15,
    imageUrl: 'assets/images/character.png' // Assicurati che l'immagine esista
  };

  sections: Section[] = [
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'inventory', label: 'Inventory', icon: '🎒' },
    { id: 'skills', label: 'Skills', icon: '⚔️' }
  ];

  inventoryFilters = [
    { id: 'all', icon: '📦' },
    { id: 'weapons', icon: '🗡️' },
    { id: 'armor', icon: '🛡️' }
  ];

  filteredItems: InventoryItem[] = [
    { name: 'Sword', icon: '🗡️' },
    { name: 'Shield', icon: '🛡️' },
    { name: 'Potion', icon: '🧪' }
  ];

  skillTiers = [
    {
      name: 'Basic Skills',
      skills: [
        { name: 'Slash', icon: '⚔️', cost: 5, unlocked: true },
        { name: 'Shield Block', icon: '🛡️', cost: 8, unlocked: false }
      ]
    }
  ];

  currentSection = 'stats';
  currentFilter = 'all';
  currentItemIndex = 0;

  prevItem() {
    if (this.currentItemIndex > 0) {
      this.currentItemIndex--;
    }
  }

  nextItem() {
    if (this.currentItemIndex < this.filteredItems.length - 1) {
      this.currentItemIndex++;
    }
  }

  performItemAction(action: string) {
    console.log(`Performing action: ${action}`);
  }

  unlockSkill(skill: Skill) {
    if (!skill.unlocked) {
      skill.unlocked = true;
      console.log(`Unlocked skill: ${skill.name}`);
    }
  }
}
