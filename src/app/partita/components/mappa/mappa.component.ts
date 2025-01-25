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

  }

  private loadSvg() {
    this.http.get('assets/images/map.svg', { responseType: 'text' }).subscribe({
      next: (svg) => {
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
        setTimeout(() => {
          this.initializeSvgPoints();
          this.observeSvgContent();  // Qui
          this.centerMap();
        }, 300); // Aumentato il timeout
      },
      error: (error) => console.error('Errore nel caricamento dell\'SVG:', error)
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

  // Aggiorna subscription
  private subscribeToGameState() {
    this.gameState.gameState$.subscribe(state => {
      if (state) {
        this.mapManager.updateState(state.personaggi, state.Punti);
      }
    });

    this.mapManager.characters$.subscribe(characters => {
      this.characters = characters;
      this.drawCharacters();
    });
  }

  private drawCharacters() {
    document.querySelectorAll('.character-piece').forEach(el => el.remove());

    this.characters.forEach(char => {
      const pointElement = this.mapManager.svgPointsMap.get(char.posizione);
      if (!pointElement) return;

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute('r', '10');
      circle.setAttribute('fill', char.tipoPersonaggio === 1 ? 'blue' : 'red');
      circle.classList.add('character-piece');
      
      pointElement.appendChild(circle);
    });
  }

  getCharacterPosition(char: any) {
    const coords = this.mapManager.getPointCoordinates(char.posizione);
    if (!coords) {
      console.warn(`Coordinate non trovate per il personaggio in posizione ${char.posizione}`);
    }
    return coords;
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

  private setupDragEvents(svgContent: HTMLElement) {
    const mapContainer = this.mapContainer.nativeElement;
    
    mapContainer.addEventListener('mousedown', (e: MouseEvent) => {
      console.log('Mouse down', { x: e.clientX, y: e.clientY });
      this.panning = true;
      e.preventDefault();
      this.start = { x: e.clientX - this.pointX, y: e.clientY - this.pointY };
      console.log('Start point', this.start);
    });
   
    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.panning) return;
      console.log('Mouse move', { x: e.clientX, y: e.clientY });
      this.pointX = e.clientX - this.start.x;
      this.pointY = e.clientY - this.start.y;
      console.log('New points', { x: this.pointX, y: this.pointY });
      this.updateMapTransform();
    });
   
    document.addEventListener('mouseup', () => {
      console.log('Mouse up, panning stopped');
      this.panning = false;
    });


    mapContainer.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      
      if (delta > 0) {
        this.zoomOut();
      } else {
        this.zoomIn();
      }
     }, { passive: false });
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