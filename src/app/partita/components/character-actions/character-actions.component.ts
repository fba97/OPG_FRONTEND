import { Component, OnInit, OnDestroy } from '@angular/core';
import { Inventario, Personaggio } from '../../../dto/personaggio';
import { GameStateService } from '../../services/game-state.service';
import { AzioniService } from '../../services/azioni.service';
import { Subscription } from 'rxjs';
import { Turno, OggettoInventario, Skill } from '../../../dto/game';
import { resolvePersonaggioImage } from '../../../shared/character-portrait';
import { personaggioBaseDaNome } from '../../../shared/personaggio-base';

interface Section {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-character-actions',
  templateUrl: './character-actions.component.html',
  styleUrls: ['./character-actions.component.css']
})
export class CharacterActionsComponent implements OnInit, OnDestroy {

  private turnoSubscription!: Subscription;
  private gameStateSubscription!: Subscription;
  constructor(private gameState: GameStateService, private azioniService: AzioniService) {}

  // Azioni residue nel turno corrente (default 2, coerente con Turno.cs lato backend)
  azioniRimanenti: number = 2;
  azioniMassimePerTurno: number = 2;

  // Null finche' il primo poll non arriva: characterInTurno$ e' derivato da actualTurno,
  // niente piu' placeholder finto (il vecchio selectedCharacter$ non veniva mai popolato).
  characterInTurn: Personaggio | null = null;
  inventory: Inventario | undefined;

  sections: Section[] = [
    { id: 'stats', label: 'Stats', icon: 'bar_chart' },
    { id: 'inventory', label: 'Inventario', icon: 'backpack' },
    { id: 'skills', label: 'Skill', icon: 'sports_martial_arts' }
  ];

  inventoryFilters = [
    { id: 'all', icon: 'inventory_2', label: 'Tutti' },
    { id: 'equipped', icon: 'shield', label: 'Equipaggiati' }
  ];

  ngOnInit(): void {
    // Sottoscrizione al turno corrente, per mostrare le azioni residue
    this.turnoSubscription = this.gameState.actualTurno$.subscribe((turno: Turno | null) => {
      if (turno) {
        this.azioniRimanenti = turno.azioniRimanenti;
        this.azioniMassimePerTurno = turno.azioniMassimePerTurno;
      }
    });

    // Catalogo skill: statico lato backend, basta caricarlo una volta.
    this.azioniService.getSkillCatalog().subscribe({
      next: (skills) => this.skillCatalog = skills,
      error: (err) => this.sbloccaSkillErrore = 'Errore nel caricare le skill: ' + (err?.error ?? err?.message ?? err)
    });

    // Un'unica sottoscrizione allo stato completo: characterInTurn.inventario e' sempre uno
    // stub vuoto (id:0, oggetti:[]) lato backend, il vero inventario di un personaggio vive
    // nell'array separato state.inventari, associato via personaggioId — verificato dal vivo
    // (Zoro con un oggetto in mano mostrava "Nessun oggetto" nel pannello finche' non e' stata
    // corretta questa lettura). Da qui deriva anche l'elenco compagni per lo Scambia.
    this.gameStateSubscription = this.gameState.gameState$.subscribe(state => {
      const tutti = state?.personaggi ?? [];
      const idTurno = state?.actualTurno?.idDelPersonaggioInTurno;
      const nuovoCharacterInTurn = tutti.find(p => p.id === idTurno) ?? null;

      if (nuovoCharacterInTurn?.id !== this.characterInTurn?.id) {
        this.currentItemIndex = 0;
      }
      this.characterInTurn = nuovoCharacterInTurn;
      this.inventory = state?.inventari?.find(inv => inv.personaggioId === nuovoCharacterInTurn?.id);

      this.compagni = tutti.filter(p =>
        (p.tipoPersonaggio === 1 || p.tipoPersonaggio === 2) && p.id !== nuovoCharacterInTurn?.id
      );
      if (!this.compagni.some(c => c.id === this.destinatarioId)) {
        this.destinatarioId = this.compagni[0]?.id ?? null;
      }
    });
  }

  resolveImage(personaggio: Personaggio | null | undefined): string {
    return resolvePersonaggioImage(personaggio);
  }

  // Oggetti dell'inventario filtrati in base alla categoria selezionata (inventoryFilters).
  // "equipped" filtra su isEquipaggiato (unico stato reale disponibile sul dato di gioco:
  // non esiste una categoria armi/armature nel modello, TipoOggetto e' Generico/Probabilita/Imprevisto).
  get filteredItems(): OggettoInventario[] {
    const items = this.inventory?.oggetti ?? [];
    if (this.currentFilter === 'equipped') {
      return items.filter(item => item.isEquipaggiato);
    }
    return items;
  }

  ngOnDestroy(): void {
    // Pulizia della sottoscrizione per evitare memory leak
    if (this.turnoSubscription) {
      this.turnoSubscription.unsubscribe();
    }
    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
    }
  }

  // Catalogo skill reale, caricato una volta in ngOnInit da GET api/Azioni/Skill.
  skillCatalog: Skill[] = [];
  sbloccaSkillErrore = '';
  sbloccaInCorsoId: number | null = null;

  // Solo le skill senza proprietario (chiunque puo' impararle) o di proprieta' del
  // personaggio in turno (confronto via PersonaggioBase, vedi personaggio-base.ts).
  get skillDisponibili(): Skill[] {
    const base = personaggioBaseDaNome(this.characterInTurn?.nome);
    return this.skillCatalog.filter(s => s.proprietario === null || s.proprietario === base);
  }

  isSkillSbloccata(skill: Skill): boolean {
    return this.characterInTurn?.skillSbloccate?.includes(skill.id) ?? false;
  }

  puoSbloccare(skill: Skill): boolean {
    return !this.isSkillSbloccata(skill) && (this.characterInTurn?.soldi ?? 0) >= skill.costo;
  }

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

  // Compagni selezionabili come destinatario di uno Scambia, e destinatario correntemente
  // selezionato nel menu a tendina del template.
  compagni: Personaggio[] = [];
  destinatarioId: number | null = null;

  usaOggettoErrore = '';
  vendiOggettoErrore = '';
  scambiaOggettoErrore = '';
  equipaggiaOggettoErrore = '';

  private avanzaDopoConsumo() {
    if (this.currentItemIndex >= this.filteredItems.length - 1 && this.currentItemIndex > 0) {
      this.currentItemIndex--;
    }
  }

  // Usa l'oggetto attualmente mostrato nel carosello inventario: applica il suo effetto
  // (es. moltiplica l'attacco) e lo consuma. A differenza di Scambia/Equipaggia, questa e'
  // collegata a un vero endpoint (AzioniController.Usa + OggettoManager.UsaOggetto).
  usaOggettoSelezionato() {
    const voce = this.filteredItems[this.currentItemIndex];
    if (!voce) {
      return;
    }
    this.usaOggettoErrore = '';
    this.azioniService.usaOggetto(voce.oggetto.id).subscribe({
      next: () => this.avanzaDopoConsumo(),
      error: (err) => this.usaOggettoErrore = 'Errore nell\'uso dell\'oggetto: ' + (err?.error ?? err?.message ?? err)
    });
  }

  // Vende l'oggetto attualmente mostrato in cambio di berry (prezzo placeholder lato server)
  // e lo consuma. Anche questa e' collegata a un vero endpoint (AzioniController.Vendi).
  vendiOggettoSelezionato() {
    const voce = this.filteredItems[this.currentItemIndex];
    if (!voce) {
      return;
    }
    this.vendiOggettoErrore = '';
    this.azioniService.vendiOggetto(voce.oggetto.id).subscribe({
      next: () => this.avanzaDopoConsumo(),
      error: (err) => this.vendiOggettoErrore = 'Errore nella vendita: ' + (err?.error ?? err?.message ?? err)
    });
  }

  // Scambia l'oggetto attualmente mostrato con il compagno selezionato nel menu a tendina.
  // E' un'azione di turno vera e propria (AzioniController.Scambia -> ActionManager).
  scambiaOggettoSelezionato() {
    const voce = this.filteredItems[this.currentItemIndex];
    if (!voce || !this.characterInTurn || this.destinatarioId === null) {
      return;
    }
    this.scambiaOggettoErrore = '';
    this.azioniService.scambiaOggetto(this.characterInTurn.id, this.destinatarioId, voce.oggetto.id).subscribe({
      next: () => this.avanzaDopoConsumo(),
      error: (err) => this.scambiaOggettoErrore = 'Errore nello scambio: ' + (err?.error ?? err?.message ?? err)
    });
  }

  // Equipaggia/disequipaggia l'oggetto attualmente mostrato (click su un oggetto gia'
  // equipaggiato lo toglie). Non consuma un'azione di turno, come Vendi.
  equipaggiaOggettoSelezionato() {
    const voce = this.filteredItems[this.currentItemIndex];
    if (!voce) {
      return;
    }
    this.equipaggiaOggettoErrore = '';
    this.azioniService.equipaggiaOggetto(voce.oggetto.id).subscribe({
      next: () => {},
      error: (err) => this.equipaggiaOggettoErrore = 'Errore nell\'equipaggiamento: ' + (err?.error ?? err?.message ?? err)
    });
  }

  terminaTurnoErrore = '';

  terminaTurno() {
    this.terminaTurnoErrore = '';
    this.azioniService.concludiTurno().subscribe({
      next: () => {},
      error: (err) => this.terminaTurnoErrore = 'Errore nel terminare il turno: ' + (err?.error ?? err?.message ?? err)
    });
  }

  // Sblocca una skill spendendo Soldi (collegato a AzioniController.SbloccaSkill).
  unlockSkill(skill: Skill) {
    if (this.isSkillSbloccata(skill) || !this.puoSbloccare(skill)) {
      return;
    }
    this.sbloccaSkillErrore = '';
    this.sbloccaInCorsoId = skill.id;
    this.azioniService.sbloccaSkill(skill.id).subscribe({
      next: (personaggio) => {
        this.sbloccaInCorsoId = null;
        this.characterInTurn = personaggio;
      },
      error: (err) => {
        this.sbloccaInCorsoId = null;
        this.sbloccaSkillErrore = 'Errore nello sblocco: ' + (err?.error ?? err?.message ?? err);
      }
    });
  }
}
