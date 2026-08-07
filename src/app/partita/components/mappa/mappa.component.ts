import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MapManagerService } from '../../services/map-manager.service';
import { GameStateService } from '../../services/game-state.service';
import { AzioniService } from '../../services/azioni.service';

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
    private gameState: GameStateService,
    private azioniService: AzioniService
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
          //this.animateZoomPan();
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
      this.setupPointClickListeners(svgElement);
    } else {
      console.error('SVG Element non trovato nel DOM');
    }
  }

  // Aggiunge il listener di click ai Punti della mappa per il movimento (click-to-move)
  private setupPointClickListeners(svgElement: SVGElement) {
    const points = svgElement.querySelectorAll('[id^="Punto_"]');
    points.forEach(point => {
      // Feedback visivo minimo: cursore a mano sui punti cliccabili
      (point as HTMLElement).style.cursor = 'pointer';

      point.addEventListener('click', (event: Event) => {
        event.stopPropagation();
        const pointId = parseInt(point.id.split('_')[1], 10);
        if (isNaN(pointId)) {
          console.error('Id punto non valido:', point.id);
          return;
        }
        this.onPointClick(pointId);
      });
    });
  }

  // Richiede lo spostamento del personaggio in turno verso il punto cliccato
  private onPointClick(pointId: number) {
    console.log('Click su punto', pointId, '- richiesta movimento');
    this.azioniService.muoviVersoPunto(pointId).subscribe({
      error: (error) => console.error('Errore durante il movimento verso il punto', pointId, error)
    });
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
      const pointElement = this.mapManager.svgPointsMap.get(char.posizione) as SVGEllipseElement;
      if (!pointElement) return;
   
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      
      // Get position from ellipse element
      const cx = pointElement.getAttribute('cx');
      const cy = pointElement.getAttribute('cy'); 
      const r = pointElement.getAttribute('ry'); 
      
      if(!cx || !cy || !r) {
        console.error('Pedina non disegnata perché svg del punto non ha cx e cy');
        return;
      }
   
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', this.getColorById(char.id));
      circle.setAttribute('style', "pointer-events: all;");
      circle.classList.add('character-piece');
   
      pointElement.parentElement?.appendChild(circle);
    });
    
   }


   getColorById(id: number): string {
    switch (id) {
      case 1: return '#FF0000';  // Red
      case 2: return '#00FF00';  // Green
      case 3: return '#0000FF';  // Blue
      case 4: return '#FFFF00';  // Yellow
      case 5: return '#FF00FF';  // Magenta
      case 6: return '#00FFFF';  // Cyan
      case 7: return '#FFA500';  // Orange
      case 8: return '#800080';  // Purple
      case 9: return '#008000';  // Dark Green
      case 10: return '#000080'; // Navy
      default: return '#000000'; // Black
    }
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
      console.log('dimensioni X', { ContainerRectWidth: containerRect.width , svgRectWidth: svgRect.width });
      console.log('dimensioni Y', { containerRectHeight: containerRect.width , svgRectHeight: svgRect.height });
      this.pointX =- 500;
      this.pointY =- 400;
      this.scale = this.scale * 0.14;
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


  //non la utilizzo ma nel caso un cui si volessero fare delle animazioni puo tornare utile
  async animateZoomPan() {
    const duration = 3000;
    const targetX = -1000; // spostamento a destra
    const targetY = -800; // spostamento a destra
    const targetScale = 0.2;
    const startScale = this.scale;
    const startX = this.pointX;
    const startY = this.pointY;
    
    const startTime = Date.now();
   
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const eased = progress * (2 - progress);
      
      this.scale = startScale + (targetScale - startScale) * eased;
      this.pointX = startX + (targetX - startX) * eased;
      this.pointY = startY + (targetY - startY) * eased;
      
      this.updateMapTransform();
   
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
   
    animate();
   }
}