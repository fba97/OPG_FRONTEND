export interface Character {
    id: number;
    name: string;
    imageUrl: string;
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    actionsRemaining: number;
    maxActionsPerTurn: number;
  }
  
  export interface Action {
    name: string;
    cost: number;
    type: 'attack' | 'defense' | 'special';
    value: number;
    description: string;
  }