import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../user.service';
import { Combattimento } from '../dto/combattimento';
import { Personaggio } from '../dto/personaggio';
import { Item } from '../dto/item';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-partita',
  templateUrl: './partita.component.html',
  styleUrls: ['./partita.component.css']
})
export class PartitaComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private scale = 1;
  private panning = false;
  private pointX = 0;
  private pointY = 0;
  private start = { x: 0, y: 0 };
  svgContent: SafeHtml | null = null;

  isSidebarVisible = true;

  cartaCasuale: string = '';
  currentTurn: string = '';
  heroesList: Array<Personaggio> = [];
  bossList: Array<Personaggio> = [];
  personaggiList: Array<Personaggio> = [];
  combattimentiList: Array<Combattimento> = [];

  eroiInCombattimento: Array<number> = [];
  bossInCombattimento: Array<number> = [];

  menuItems = [
    { name: 'Mainpage', url: 'http://localhost:4200/mainpage' },
    { name: 'Login', url: 'http://localhost:4200/login' },
    { name: 'Register', url: 'http://localhost:4200/register' },
    { name: 'Eroi', url: 'http://localhost:4200/personaggi' },
    { name: 'Combattimento', url: 'http://localhost:4200/combattimento' }
  ];

  constructor(private service: UserService, private modalService: NgbModal, private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadSvg();
    /* this.loadCombattimenti(); 
    this.loadPersonaggi(); */
  }

  ngAfterViewInit() {
    console.log(this.mapContainer);  // Verifica se il riferimento è corretto
    setTimeout(() => {
      if (this.mapContainer) {
        this.observeSvgContent();
      } else {
        console.error('mapContainer non è ancora disponibile');
      }
    }, 200);
  }


  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

private loadSvg() {
  this.http.get('assets/images/map.svg', { responseType: 'text' }).subscribe({
    next: (svg) => {
      console.log('SVG caricato correttamente', svg); // Log il contenuto SVG
      this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
    },
    error: (error) => {
      console.error('Errore nel caricamento dell\'SVG:', error);
    },
    complete: () => {
      console.log('Caricamento dell\'SVG completato');
    }
  });
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

    this.pointX = clientX - this.start.x;
    this.pointY = clientY - this.start.y;

    this.updateMapTransform();
  }

  private endPan() {
    this.panning = false;
  }

  private updateMapTransform() {
    const mapContainer = this.mapContainer.nativeElement.querySelector('.svg-content') as HTMLElement;
    if (mapContainer) {
      mapContainer.style.transform = `translate(${this.pointX}px, ${this.pointY}px) scale(${this.scale})`;
    }
  }

  zoomIn() {
    this.scale *= 1.2;
    this.updateMapTransform();
  }

  zoomOut() {
    this.scale /= 1.2;
    this.updateMapTransform();
  }

  resetZoom() {
    this.scale = 1;
    this.pointX = 0;
    this.pointY = 0;
    this.updateMapTransform();
  }

  private loadCombattimenti() {
    this.service.findAllCombattimentiattivi().subscribe(response => {
      this.combattimentiList = response as Array<Combattimento>;
    });
  }

  private loadPersonaggi() {
    this.service.findAllHeroes().subscribe(response => {
      this.personaggiList = response as Array<Personaggio>;

      this.heroesList = this.personaggiList.filter(p => p.id <= 6);
      this.bossList = this.personaggiList.filter(p => p.id > 6);

      if (this.heroesList.length > 0) {
        this.currentTurn = this.heroesList[0].nome;
      }
    });
  }

  itemsList: Array<Item> = [
    { id: 1, nome: "Usopp", descrizione: "descrizione", carta: "/assets/images/oggetti/baffotti.svg" },
    // Altri oggetti...
  ];
}
