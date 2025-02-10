import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-turn',
    templateUrl: './turn.component.html',
    styleUrls: []
})

export class TurnComponent implements OnInit {
  @ViewChild('turn-component-container') turnComponentContainer!: ElementRef;

  svgContentTurn: SafeHtml | null = null;

    constructor(
        private http: HttpClient,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        this.loadSvg();
    }

    private loadSvg() {
        this.http.get('assets/images/UI/turn.svg', { responseType: 'text' }).subscribe({
            next: (svg) => {
                this.svgContentTurn = this.sanitizer.bypassSecurityTrustHtml(svg);
                setTimeout(() => { 
                    this.observeSvgContent();
                }, 300);
            },
            error: (error) => console.error('Errore nel caricamento dell\'SVG:', error)
        });
    }

    
  private observeSvgContent() {
    if (!this.turnComponentContainer) {
      console.error('mapContainer non è definito!');
      return;
    }
    const mapContainerEl = this.turnComponentContainer.nativeElement;
    const svgContent = mapContainerEl.querySelector('.svg-content-turn') as HTMLElement;
    console.log(svgContent); // Log l'elemento svg-content trovato
    if (svgContent) {
      //this.setupDragEvents(svgContent);
    } else {
      console.error('Non è stato trovato un elemento .svg-content');
    }
  }

}