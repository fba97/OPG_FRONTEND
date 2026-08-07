import { Component, OnInit, OnDestroy  } from '@angular/core';
import { Inventario, Personaggio } from '../../../dto/personaggio';
import { GameStateService } from '../../services/game-state.service';
import { Subscription } from 'rxjs';
import { Turno } from '../../../dto/game';


interface Section {
  id: string;
  label: string;
  icon: string;
}

interface Skill {
  id: number;
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
export class CharacterActionsComponent implements OnInit, OnDestroy {

  private characterSubscription!: Subscription;
  private turnoSubscription!: Subscription;
  constructor(private gameState: GameStateService) {}

  // Azioni residue nel turno corrente (default 2, coerente con Turno.cs lato backend)
  azioniRimanenti: number = 2;
  azioniMassimePerTurno: number = 2;

  characterInTurn: Personaggio = {    id: 1, nome: 'prova', puntiVita:30, attacco: 5, difesa:10, descrizione:'Descrizione', tipoPersonaggio: 1, posizione: 1, taglia: 1, livello: 1, gittataAttacco: 1, gittataOggetti: 1,inventario:     
    {
      id: 1,
      personaggioId: 1,
      capacitaMassima: 1,
      tipo: 1,
      oggetti: []
    }, 
    stato: 1,  
    selected: true, 
    imageUrl: '' 
  }
  inventory: Inventario | undefined;

  sections: Section[] = [
    { id: 'stats', label: '', icon: '📊' },
    { id: 'inventory', label: '', icon: '🎒' },
    { id: 'skills', label: '', icon: '⚔️' }
  ];

  inventoryFilters = [
    { id: 'all', icon: '📦' },
    { id: 'weapons', icon: '🗡️' },
    { id: 'armor', icon: '🛡️' }
  ];


  ngOnInit(): void {
    // Sottoscrizione al personaggio selezionato
    if(this.gameState.selectedCharacter$ == null)
    {
      
    }
    this.characterSubscription = this.gameState.selectedCharacter$.subscribe(c => {
      if (c) {
        this.characterInTurn = c;
      }
      // Puoi aggiungere qui ulteriori logiche per aggiornare il componente in base al personaggio selezionato
    });
    this.inventory = this.characterInTurn?.inventario;

    // Sottoscrizione al turno corrente, per mostrare le azioni residue
    this.turnoSubscription = this.gameState.actualTurno$.subscribe((turno: Turno | null) => {
      if (turno) {
        this.azioniRimanenti = turno.azioniRimanenti;
        this.azioniMassimePerTurno = turno.azioniMassimePerTurno;
      }
    });
  }

  
  ngOnDestroy(): void {
    // Pulizia della sottoscrizione per evitare memory leak
    if (this.characterSubscription) {
      this.characterSubscription.unsubscribe();
    }
    if (this.turnoSubscription) {
      this.turnoSubscription.unsubscribe();
    }
  }

  // Skill tiers and skills
  skillTiers = [
    {
      name: 'Novice',
      skills: [
        { id: 1, name: 'Basic Attack', icon: '⚔️', unlocked: false, cost: 0 }
      ]
    },
    {
      name: 'Adept',
      skills: [
        { id: 2, name: 'Power Strike', icon: '💥', unlocked: false, cost: 300 }
      ]
    },
    {
      name: 'Master',
      skills: [
        { id: 3, name: 'Whirlwind', icon: '🌪️', unlocked: false, cost: 800 }
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
    var filteredItemsLenght = 0;
    if(this.inventory != null)
      filteredItemsLenght = this.inventory.oggetti.length;

    if (this.currentItemIndex < filteredItemsLenght - 1) {
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
