import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CombatTarget, GameStateService } from '../../services/game-state.service';
import { AzioniService } from '../../services/azioni.service';
import { Personaggio } from '../../../dto/personaggio';
import { Skill } from '../../../dto/game';
import { resolvePersonaggioImage } from '../../../shared/character-portrait';
import { personaggioBaseDaNome } from '../../../shared/personaggio-base';

@Component({
  selector: 'app-combat-modal',
  templateUrl: './combat-modal.component.html',
  styleUrls: ['./combat-modal.component.css']
})
export class CombatModalComponent implements OnInit, OnDestroy {
  target: CombatTarget | null = null;
  attaccante: Personaggio | null = null;
  attaccato: Personaggio | null = null;

  attaccoInCorso = false;
  fuggiInCorso = false;
  attaccoErrore = '';
  fuggiErrore = '';
  ultimoDanno: number | null = null;

  skillCatalog: Skill[] = [];
  skillInCorsoId: number | null = null;
  skillErrore = '';

  private targetSub!: Subscription;
  private gameStateSub!: Subscription;

  constructor(private gameState: GameStateService, private azioniService: AzioniService) {}

  // Skill sbloccate dall'attaccante e usabili in combattimento (stesso filtro per proprieta'
  // del pannello Skill in character-actions, qui applicato all'attaccante del combattimento).
  get skillUsabili(): Skill[] {
    if (!this.attaccante) {
      return [];
    }
    const base = personaggioBaseDaNome(this.attaccante.nome);
    return this.skillCatalog.filter(s =>
      (s.proprietario === null || s.proprietario === base) &&
      this.attaccante!.skillSbloccate?.includes(s.id)
    );
  }

  ngOnInit(): void {
    this.azioniService.getSkillCatalog().subscribe({
      next: (skills) => this.skillCatalog = skills,
      error: () => {}
    });

    this.targetSub = this.gameState.combatTarget$.subscribe(target => {
      this.target = target;
      this.attaccoErrore = '';
      this.fuggiErrore = '';
      this.skillErrore = '';
      this.ultimoDanno = null;
      this.attaccante = target?.attaccante ?? null;
      this.attaccato = target?.attaccato ?? null;
    });

    // Tiene i due personaggi aggiornati con l'HP corrente ad ogni poll (ogni 1s), cosi' il
    // modale riflette i danni subiti senza dover richiamare l'endpoint di attacco.
    this.gameStateSub = this.gameState.gameState$.subscribe(state => {
      if (!state || !this.target) {
        return;
      }
      const a = state.personaggi.find(p => p.id === this.target!.attaccante.id);
      const d = state.personaggi.find(p => p.id === this.target!.attaccato.id);
      if (a) { this.attaccante = a; }
      if (d) { this.attaccato = d; }
    });
  }

  ngOnDestroy(): void {
    this.targetSub?.unsubscribe();
    this.gameStateSub?.unsubscribe();
  }

  resolveImage(personaggio: Personaggio | null): string {
    return resolvePersonaggioImage(personaggio);
  }

  chiudi() {
    this.gameState.clearCombatTarget();
  }

  attacca() {
    if (!this.attaccante || !this.attaccato) {
      return;
    }
    this.attaccoErrore = '';
    this.attaccoInCorso = true;
    const vitaPrima = this.attaccato.punti_Vita;

    this.azioniService.attacca(this.attaccato.id, this.attaccante.id).subscribe({
      next: (result) => {
        this.attaccoInCorso = false;
        this.ultimoDanno = vitaPrima - result.difensore.punti_Vita;
        this.attaccato = result.difensore;
        this.attaccante = result.personaggio;
      },
      error: (err) => {
        this.attaccoInCorso = false;
        this.attaccoErrore = this.messaggioErrore(err);
      }
    });
  }

  usaSkill(skill: Skill) {
    if (!this.attaccante || !this.attaccato) {
      return;
    }
    this.skillErrore = '';
    this.skillInCorsoId = skill.id;
    const vitaPrima = this.attaccato.punti_Vita;

    this.azioniService.usaSkill(skill.id, this.attaccato.id).subscribe({
      next: (result) => {
        this.skillInCorsoId = null;
        this.ultimoDanno = vitaPrima - result.difensore.punti_Vita;
        this.attaccato = result.difensore;
        this.attaccante = result.personaggio;
      },
      error: (err) => {
        this.skillInCorsoId = null;
        this.skillErrore = this.messaggioErrore(err);
      }
    });
  }

  fuggi() {
    this.fuggiErrore = '';
    this.fuggiInCorso = true;

    this.azioniService.fuggi().subscribe({
      next: () => {
        this.fuggiInCorso = false;
        this.chiudi();
      },
      error: (err) => {
        this.fuggiInCorso = false;
        this.fuggiErrore = this.messaggioErrore(err);
      }
    });
  }

  private messaggioErrore(err: any): string {
    if (typeof err?.error === 'string' && err.error.length > 0) {
      return err.error;
    }
    if (err?.error?.message) {
      return err.error.message;
    }
    return err?.message ?? 'Errore sconosciuto.';
  }
}
