import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MapManagerService } from '../../services/map-manager.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-mappa',
  templateUrl: './mappa.component.html',
  styleUrls: ['./mappa.component.css']
})
export class MappaComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private scale = 1;
  private panning = false;
  private pointX = 0;
  private pointY = 0;
  private start = { x: 0, y: 0 };
  characters: any[] = [];
  svgContent: SafeHtml | null = null;

  constructor(
    private http: HttpClient, 
    private sanitizer: DomSanitizer, 
    private mapManager: MapManagerService, 
    private gameState: GameStateService
  ) {}

  ngOnInit(): void {
    this.loadSvg();
    this.subscribeToGameState();
  }

  ngAfterViewInit() {
    // Rimuoviamo il setTimeout qui perché gestiremo l'osservazione 
    // dopo il caricamento effettivo dell'SVG
    this.observeSvgContent();
  }

  private loadSvg() {
    this.http.get('assets/images/map.svg', { responseType: 'text' }).subscribe({
      next: (svg) => {
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
        // Aspettiamo che l'SVG sia nel DOM
        setTimeout(() => {
          this.initializeSvgPoints();
          this.centerMap();
        }, 100);
      },
      error: (error) => {
        console.error('Errore nel caricamento dell\'SVG:', error);
      }
    });
  }

  private initializeSvgPoints() {
    const mapContainerEl = this.mapContainer.nativeElement;
    const svgElement = mapContainerEl.querySelector('.svg-content svg') as SVGElement;
    
    if (svgElement) {
      console.log('SVG Element trovato, registro i punti');
      this.mapManager.registerSvgPoints(svgElement);
    } else {
      console.error('SVG Element non trovato nel DOM');
    }
  }

  private subscribeToGameState() {
    this.gameState.gameState$.subscribe(state => {
      if (state) {
        console.log('Personaggi ricevuti:', state.personaggi);
        console.log('Punti ricevuti:', state.Punti);
        
        // Verifichiamo che i punti siano stati registrati
        const firstCharacter = state.personaggi[0];
        if (firstCharacter) {
          const coords = this.mapManager.getPointCoordinates(firstCharacter.posizione);
          console.log(`Coordinate per personaggio in posizione ${firstCharacter.posizione}:`, coords);
        }
        
        this.mapManager.updateState(
          state.personaggi,
          state.Punti
        );
      }
    });

    this.mapManager.characters$.subscribe(characters => {
      this.characters = characters;
      console.log('Characters aggiornati:', characters);
    });
  }

  getCharacterPosition(char: any) {
    const coords = this.mapManager.getPointCoordinates(char.posizione);
    if (!coords) {
      console.warn(`Coordinate non trovate per il personaggio in posizione ${char.posizione}`);
    }
    return coords;
  }
  
  private centerMap() {
    const mapContainer = this.mapContainer.nativeElement;
    const svgContent = mapContainer.querySelector('.svg-content') as HTMLElement;

    if (svgContent) {
      // Ottieni le dimensioni del container e dell'SVG
      const containerRect = mapContainer.getBoundingClientRect();
      const svgRect = svgContent.getBoundingClientRect();

      // Calcola le coordinate per centrare
      this.pointX = (containerRect.width - svgRect.width) / 2;
      this.pointY = (containerRect.height - svgRect.height) / 2;

      this.updateMapTransform();
    }
  }


  private observeSvgContent() {
    if (!this.mapContainer) {
      console.error('mapContainer non è definito!');
      return;
    }
    const mapContainerEl = this.mapContainer.nativeElement;
    const svgContent = mapContainerEl.querySelector('.svg-content') as HTMLElement;
    console.log(svgContent); // Log l'elemento svg-content trovato
    if (svgContent) {
      this.setupDragEvents(svgContent);
    } else {
      console.error('Non è stato trovato un elemento .svg-content');
    }


  }

  private setupDragEvents(svgContent: HTMLElement) {
    svgContent.addEventListener('mousedown', this.startPan.bind(this));
    svgContent.addEventListener('mousemove', this.movePan.bind(this));
    document.addEventListener('mouseup', this.endPan.bind(this));

    svgContent.addEventListener('touchstart', this.startPan.bind(this), { passive: false });
    svgContent.addEventListener('touchmove', this.movePan.bind(this), { passive: false });
    svgContent.addEventListener('touchend', this.endPan.bind(this));
  }

  private startPan(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.panning = true;

    if (event instanceof MouseEvent) {
      this.start = { x: event.clientX - this.pointX, y: event.clientY - this.pointY };
    } else if (event instanceof TouchEvent && event.touches.length === 1) {
      const touch = event.touches[0];
      this.start = { x: touch.clientX - this.pointX, y: touch.clientY - this.pointY };
    }
  }

  private movePan(event: MouseEvent | TouchEvent) {
    if (!this.panning) return;

    let clientX: number, clientY: number;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event instanceof TouchEvent && event.touches.length === 1) {
      const touch = event.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      return;
    }
    // Calcola le nuove coordinate
    const newPointX = clientX - this.start.x;
    const newPointY = clientY - this.start.y;

    // Opzionale: Aggiungi limiti al pan
    const mapContainer = this.mapContainer.nativeElement;
    const svgContent = mapContainer.querySelector('.svg-content') as HTMLElement;
    if (svgContent) {
      const containerRect = mapContainer.getBoundingClientRect();
      const svgRect = svgContent.getBoundingClientRect();

      // Imposta dei limiti al pan (puoi modificare questi valori)
      const maxX = containerRect.width;
      const maxY = containerRect.height;

      this.pointX = Math.min(Math.max(newPointX, -maxX), maxX);
      this.pointY = Math.min(Math.max(newPointY, -maxY), maxY);

      this.updateMapTransform();
    }
  }

  private endPan() {
    this.panning = false;
  }

  private updateMapTransform() {
    const mapContainer = this.mapContainer.nativeElement.querySelector('.svg-content') as HTMLElement;
    if (mapContainer) {
      // Usa translate3d per migliorare le performance
      mapContainer.style.transform = `translate3d(${this.pointX}px, ${this.pointY}px, 0) scale(${this.scale})`;
    }
  }

  zoomIn() {
    this.scale *= 1.2;
    this.updateMapTransform();
  }

  zoomOut() {
    const oldScale = this.scale;
    this.scale /= 1.2;
    this.adjustZoomPoint(oldScale);
    this.updateMapTransform();
  }
  private adjustZoomPoint(oldScale: number) {
    const mapContainer = this.mapContainer.nativeElement;
    const containerRect = mapContainer.getBoundingClientRect();

    // Calcola il punto centrale del container
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // Aggiusta i punti di traslazione per mantenere il centro durante lo zoom
    const scaleFactor = this.scale / oldScale;
    const dx = (centerX - this.pointX) * (scaleFactor - 1);
    const dy = (centerY - this.pointY) * (scaleFactor - 1);

    this.pointX -= dx;
    this.pointY -= dy;
  }

  resetZoom() {
    this.scale = 1;
    this.centerMap(); // Invece di resettare a 0,0, torna al centro
  }
}