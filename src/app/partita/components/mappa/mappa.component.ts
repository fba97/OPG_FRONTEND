import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MapManagerService } from '../../services/map-manager.service';
import { GameStateService } from '../../services/game-state.service';
import { AzioniService } from '../../services/azioni.service';
import { Punto } from '../../../dto/game';

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
  private dragStart = { x: 0, y: 0 };
  private dragMoved = false;
  characters: any[] = [];
  svgContent: SafeHtml | null = null;
  private punti: Punto[] = [];

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
      this.setupAreaClickListeners(svgElement);
    } else {
      console.error('SVG Element non trovato nel DOM');
    }
  }

  // Aggiunge il listener di click ai Punti della mappa per il movimento (click-to-move)
  private setupPointClickListeners(svgElement: SVGElement) {
    const points = svgElement.querySelectorAll('[id^="Punto_"]');
    points.forEach(point => {
      const el = point as HTMLElement;

      // Evidenzia il punto al passaggio del mouse, solo se non e' bloccato
      el.addEventListener('mouseenter', () => {
        const pointId = parseInt(point.id.split('_')[1], 10);
        if (!this.isPuntoBloccato(pointId)) {
          el.style.filter = 'brightness(1.6) drop-shadow(0 0 4px #00ff88)';
        }
      });
      el.addEventListener('mouseleave', () => {
        el.style.filter = '';
      });

      point.addEventListener('click', (event: Event) => {
        event.stopPropagation();
        if (this.dragMoved) {
          // Click "fantasma" generato dal rilascio del mouse dopo un trascinamento
          // della mappa: non e' un'intenzione di movimento, va ignorato.
          return;
        }
        const pointId = parseInt(point.id.split('_')[1], 10);
        if (isNaN(pointId)) {
          console.error('Id punto non valido:', point.id);
          return;
        }
        this.onPointClick(pointId);
      });
    });

    this.updatePointsHighlighting();
  }

  // Punto bloccato = non ci si puo' muovere li' (campo Blocco lato backend)
  private isPuntoBloccato(pointId: number): boolean {
    return this.punti.find(p => p.id === pointId)?.blocco ?? false;
  }

  // Applica cursore/opacita' a tutti i punti registrati in base a Blocco: distingue
  // visivamente i punti raggiungibili da quelli bloccati, invece di scoprirlo solo dopo
  // aver cliccato. Gli stili sono inline (non tramite classi CSS) perche' l'SVG e'
  // iniettato via innerHTML/SafeHtml e non e' raggiungibile dalle regole CSS con
  // l'encapsulation standard di Angular.
  private updatePointsHighlighting() {
    this.mapManager.svgPointsMap.forEach((element, pointId) => {
      if (this.isPuntoBloccato(pointId)) {
        element.style.cursor = 'not-allowed';
        element.style.opacity = '0.35';
      } else {
        element.style.cursor = 'pointer';
        element.style.opacity = '1';
      }
    });
  }

  // Richiede lo spostamento del personaggio in turno verso il punto cliccato,
  // dopo conferma dell'utente. Se il punto e' bloccato, avvisa senza chiamare l'API.
  private onPointClick(pointId: number) {
    if (this.isPuntoBloccato(pointId)) {
      alert(`Il punto ${pointId} e' bloccato: non puoi spostarti li'.`);
      return;
    }

    const punto = this.punti.find(p => p.id === pointId);
    const nomePunto = punto?.descrizione || `punto ${pointId}`;
    const confermato = confirm(`Vuoi spostare il personaggio in ${nomePunto}?`);
    if (!confermato) {
      return;
    }

    this.azioniService.muoviVersoPunto(pointId).subscribe({
      error: (error) => console.error('Errore durante il movimento verso il punto', pointId, error)
    });
  }

  // Aggiunge il listener di click alle Aree della mappa: zoom sull'area cliccata.
  // I click sui Punti (annidati dentro le Aree nell'SVG) fermano la propagazione da
  // soli, quindi non arrivano mai qui: cliccare un punto muove, cliccare altrove
  // nell'area zooma.
  private setupAreaClickListeners(svgElement: SVGElement) {
    const areas = svgElement.querySelectorAll('[id^="Area_"]');
    areas.forEach(area => {
      area.addEventListener('click', () => {
        if (this.dragMoved) {
          // Click "fantasma" dopo un trascinamento della mappa, non un vero click.
          return;
        }
        this.zoomToArea(area as SVGGraphicsElement);
      });
    });
  }

  private readonly AREA_ZOOM_SCALE = 3.5;

  // Zooma centrando l'area cliccata: prima applica il livello di zoom target,
  // poi misura dove l'area finisce sullo schermo (getBoundingClientRect, che
  // riflette gia' il nuovo transform) e trasla la mappa per centrarla li'.
  private zoomToArea(areaElement: SVGGraphicsElement) {
    this.scale = this.AREA_ZOOM_SCALE;
    this.pointX = 0;
    this.pointY = 0;
    this.updateMapTransform();

    requestAnimationFrame(() => {
      const containerRect = this.mapContainer.nativeElement.getBoundingClientRect();
      const areaRect = areaElement.getBoundingClientRect();

      const containerCenterX = containerRect.left + containerRect.width / 2;
      const containerCenterY = containerRect.top + containerRect.height / 2;
      const areaCenterX = areaRect.left + areaRect.width / 2;
      const areaCenterY = areaRect.top + areaRect.height / 2;

      this.pointX += containerCenterX - areaCenterX;
      this.pointY += containerCenterY - areaCenterY;
      this.updateMapTransform();
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

    this.mapManager.points$.subscribe(punti => {
      this.punti = punti;
      this.updatePointsHighlighting();
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


  // L'SVG (viewBox 0 0 1564.7873 1740.7908, preserveAspectRatio di default "xMidYMid
  // meet") si adatta e si centra gia' da solo dentro il suo contenitore CSS (100%x100%
  // di .map-container) senza bisogno di alcun transform: prima qui venivano applicati
  // offset/scala arbitrari (calcolati per uno schermo specifico, mai in base alle
  // dimensioni reali del container) che spostavano la mappa FUORI dal centro invece
  // di centrarla. Riportare pointX/pointY/scale allo stato neutro (nessun transform)
  // e' quindi la centratura corretta: zoom e trascinamento restano relativi a questa
  // base pulita.
  private centerMap() {
    this.pointX = 0;
    this.pointY = 0;
    this.scale = 1;
    this.updateMapTransform();
  }

  private setupDragEvents(svgContent: HTMLElement) {
    const mapContainer = this.mapContainer.nativeElement;

    mapContainer.addEventListener('mousedown', (e: MouseEvent) => {
      console.log('Mouse down', { x: e.clientX, y: e.clientY });
      this.panning = true;
      this.dragMoved = false;
      this.dragStart = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      this.start = { x: e.clientX - this.pointX, y: e.clientY - this.pointY };
      console.log('Start point', this.start);
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.panning) return;
      console.log('Mouse move', { x: e.clientX, y: e.clientY });
      if (!this.dragMoved) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        // Soglia oltre la quale consideriamo il gesto un vero trascinamento della mappa,
        // non un click: sotto questa soglia rimane un click valido su un punto.
        if (Math.hypot(dx, dy) > 6) {
          this.dragMoved = true;
        }
      }
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