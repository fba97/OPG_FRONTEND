import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { MapManagerService } from '../../services/map-manager.service';
import { GameStateService } from '../../services/game-state.service';
import { AzioniService } from '../../services/azioni.service';
import { Area, Punto, TipoPersonaggio, StatoMissione, Missione, TipoInventario, OggettoInventario, EventoMappa, TipoOggetto } from '../../../dto/game';
import { Personaggio } from '../../../dto/personaggio';
import { resolvePersonaggioImage } from '../../../shared/character-portrait';
import { resolveOggettoImage } from '../../../shared/item-art';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Redesign della mappa (2026-08-11): niente piu' drag/zoom libero — sostituito da una
// camera a due stati calcolati a codice (overview / area) con transizione animata via
// viewBox nativo (non transform CSS, per evitare sgranatura — vedi commento su `viewBox`
// piu' sotto). Lo zoom scatta al click su una Tessera (mai sul centro dell'intera Area,
// che puo' non essere compatta — vedi entraInTessera) o automaticamente a inizio turno
// (segue il personaggio in turno). Una volta zoomati si disegna direttamente sulla mappa
// overview esistente (vettoriale, nessuna sgranatura) — nessun file esterno necessario di
// default. Un file disegnato a mano per una singola Area (AREA_DETAIL_SVG) resta un
// arricchimento opzionale, non un requisito. Vedi il piano `cuddly-riding-starfish.md` per
// il contesto completo. Non verificato dal vivo in questa sessione: gli strumenti Chrome
// DevTools MCP si sono disconnessi durante lo sviluppo — da testare in browser reale
// appena si riconnettono, prima di considerarlo definitivo.
@Component({
  selector: 'app-mappa',
  templateUrl: './mappa.component.html',
  styleUrls: ['./mappa.component.css']
})
export class MappaComponent implements OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  // Lo zoom e' implementato manipolando direttamente l'attributo viewBox della root <svg>,
  // non un transform CSS scale(): un transform su un elemento con will-change (o comunque
  // promosso a compositing layer dalla GPU) puo' scalare un livello bitmap gia' rasterizzato
  // invece di far ridisegnare i path vettoriali al motore SVG, causando una sgranatura
  // visibile — bug reale segnalato dall'utente, sia sulla mappa che sulle pedine disegnate
  // sopra. Il viewBox nativo evita il problema alla radice: il browser ridisegna sempre a
  // piena risoluzione qualunque sia il livello di zoom.
  private viewBox = { x: 0, y: 0, width: 1564.7873, height: 1740.7908 };
  // Stato "a riposo" della mappa overview (non del documento correntemente mostrato, che
  // puo' essere un file di dettaglio con un viewBox diverso) — a cui torna "Torna alla mappa".
  private viewBoxOverviewIniziale = { x: 0, y: 0, width: 1564.7873, height: 1740.7908 };
  private svgRootElement: SVGElement | null = null;
  private animandoCamera = false;

  // Stato della camera: 'overview' = mappa intera, solo Aree cliccabili, niente
  // personaggi/oggetti/eventi disegnati. 'area' = camera zoomata su un'Area, punti
  // cliccabili e pedine disegnate — di default direttamente sulla mappa overview gia'
  // zoomata (dettaglioCaricato=false), oppure su un file disegnato a mano se ne esiste
  // uno per quell'Area (arricchimento opzionale, vedi AREA_DETAIL_SVG).
  cameraState: 'overview' | 'area' = 'overview';
  activeAreaId: number | null = null;
  // La camera si centra sempre su una Tessera specifica (cluster fisicamente compatto),
  // mai sul bounding box dell'intera Area — vedi calcolaInquadraturaPunti.
  private activeTesseraId: number | null = null;
  // Punti della Tessera attiva + limitrofe (calcolato una volta all'ingresso, non ad ogni
  // redraw) — lo scope di default per interattivita'/disegno quando non c'e' un file di
  // dettaglio caricato. Vedi trovaTessereLimitrofe.
  private puntiScopeAttivo: Set<number> | null = null;
  private dettaglioCaricato = false;

  private mapSvgRaw: string | null = null;
  private detailSvgCache = new Map<number, string>();
  // Risolta quando la mappa overview e' pronta (SVG nel DOM + punti registrati in
  // MapManagerService). Lo zoom automatico a inizio turno (characterInTurno$) puo' scattare
  // prima che questo accada — bug reale riscontrato testando: la subscription e' attivata
  // in ngOnInit subito dopo loadSvg(), ma il caricamento dell'SVG e' asincrono (fetch +
  // attesa di un tick per il render via innerHTML) e la prima notifica di stato/turno puo'
  // arrivare prima. Senza attendere questa promise, calcolaInquadraturaPunti trova
  // svgPointsMap ancora vuota e l'inquadratura fallisce silenziosamente.
  private mappaPronta: Promise<void> | null = null;

  // Arricchimento OPZIONALE: popolato man mano che l'utente disegna a mano una mappa di
  // dettaglio per una singola Area (Area id -> path asset). Senza una voce qui, l'Area
  // funziona comunque — si disegna/interagisce direttamente sulla mappa overview zoomata,
  // che e' vettoriale e non si sgrana. Utile per Aree molto dense (es. Area_6, 126 punti)
  // o per includere in un solo file punti di Aree confinanti.
  private readonly AREA_DETAIL_SVG: Record<number, string> = {};

  characters: Personaggio[] = [];
  svgContent: SafeHtml | null = null;
  private punti: Punto[] = [];
  private aree: Area[] = [];
  private characterInTurno: Personaggio | null = null;
  private itemsMappa: OggettoInventario[] = [];
  private eventiMappa: EventoMappa[] = [];

  // Gruppo SVG unico, appeso come ultimo figlio della root <svg> in uso (overview o file di
  // dettaglio), dove finiscono TUTTI gli elementi disegnati a runtime (hit-area dei punti,
  // pedine personaggi, icone oggetti/eventi). L'ordine di stacking in SVG segue l'ordine
  // nell'intero albero del documento, non l'ordine locale di append: senza questo overlay,
  // una pedina poteva finire coperta da un elemento di un'Area diversa. Le coordinate
  // locali di ciascun Punto vengono convertite nello spazio della root <svg> tramite
  // getCTM() prima di essere usate in questo overlay.
  private overlayGroup: SVGGElement | null = null;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private mapManager: MapManagerService,
    private gameState: GameStateService,
    private azioniService: AzioniService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSvg();
    this.subscribeToGameState();
  }

  private loadSvg() {
    this.http.get('assets/images/map.svg', { responseType: 'text' }).subscribe({
      next: (svg) => {
        this.mapSvgRaw = svg;
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
        this.mappaPronta = this.attendiRenderEInizializza(() => {
          this.initializeOverview();
          this.centerMap();
        });
      },
      error: (error) => console.error('Errore nel caricamento dell\'SVG:', error)
    });
  }

  // L'SVG e' iniettato via [innerHTML] (SafeHtml): serve un tick per essere nel DOM prima
  // di poterlo interrogare/registrare. Restituisce una Promise cosi' i chiamanti (swap di
  // documento in entraInTessera/tornaAOverview) possono sequenziare correttamente le fasi.
  private attendiRenderEInizializza(init: () => void): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        init();
        resolve();
      }, 300);
    });
  }

  private getSvgElement(): SVGElement | null {
    const mapContainerEl = this.mapContainer.nativeElement;
    const svgElement = mapContainerEl.querySelector('.svg-content svg') as SVGElement;
    if (!svgElement) {
      console.error('SVG Element non trovato nel DOM');
      return null;
    }
    return svgElement;
  }

  // L'SVG esportato da Inkscape porta width/height in mm (es. "1564.7874mm") come
  // attributi di presentazione: fanno si' che l'elemento si disegni alla sua dimensione
  // fisica reale invece di adattarsi al container. La regola CSS .svg-content non lo
  // sovrascrive perche' l'SVG e' iniettato via innerHTML e non porta l'attributo
  // _ngcontent-* di Angular — stile inline diretto = niente scoping.
  private prepareSvgElement(svgElement: SVGElement) {
    svgElement.style.width = '100%';
    svgElement.style.height = '100%';
    this.overlayGroup = document.createElementNS(SVG_NS, 'g');
    this.overlayGroup.setAttribute('id', 'opg-overlay');
    svgElement.appendChild(this.overlayGroup);
  }

  // Legge il viewBox reale del documento mostrato (puo' differire tra overview e un file
  // di dettaglio) e tiene un riferimento diretto all'elemento <svg> per poterlo aggiornare
  // durante l'animazione (applyViewBox).
  private parseViewBox(svgElement: SVGElement) {
    this.svgRootElement = svgElement;
    const viewBox = svgElement.getAttribute('viewBox');
    if (!viewBox) return;
    const parti = viewBox.split(/\s+/).map(Number);
    if (parti.length === 4 && parti.every(n => !isNaN(n))) {
      this.viewBox = { x: parti[0], y: parti[1], width: parti[2], height: parti[3] };
    }
  }

  // Setup della mappa overview: solo le Aree sono interattive (hover + click per entrare
  // nel dettaglio). Nessun punto/personaggio/oggetto/evento viene disegnato o reso
  // cliccabile qui — e' il compito esplicito della vista di dettaglio (troppa densita'
  // per essere leggibile/cliccabile con precisione su 284 punti insieme).
  private initializeOverview() {
    const svgElement = this.getSvgElement();
    if (!svgElement) return;
    this.prepareSvgElement(svgElement);
    this.parseViewBox(svgElement);
    this.viewBoxOverviewIniziale = { ...this.viewBox };
    this.mapManager.registerSvgPoints(svgElement);
    this.setupTesseraHoverAndClick(svgElement);
  }

  // Setup della vista di dettaglio (file disegnato a mano, arricchimento opzionale): tutti
  // i punti effettivamente presenti nel file sono interattivi — puo' includere punti di
  // Aree confinanti (idea validata con l'utente: un file puo' coprire piu' Aree per
  // permettere il movimento tra zone limitrofe senza tornare all'overview), quindi nessun
  // filtro sull'appartenenza "ufficiale" all'Area cliccata.
  private initializeDettaglio(areaId: number) {
    const svgElement = this.getSvgElement();
    if (!svgElement) return;
    this.prepareSvgElement(svgElement);
    this.parseViewBox(svgElement);
    this.mapManager.registerSvgPoints(svgElement);
    this.setupPointClickListeners(svgElement);
  }

  // Hover (stroke glow) e click direttamente sulle Tessere della mappa overview — non
  // sulle Aree: un'Area puo' non essere geometricamente compatta (es. l'acqua che avvolge
  // tutta la mappa lungo il perimetro), quindi sia l'evidenziazione che il centro dello
  // zoom devono sempre riferirsi alla Tessera precisa sotto il cursore, mai all'Area
  // intera — bug reale segnalato dall'utente dopo un test dal vivo. Il passaggio del mouse
  // evidenzia la Tessera E le sue vicine (trovaTessereLimitrofe), cosi' si vede subito
  // quale gruppo diventera' interattivo al click, non solo l'esagono singolo.
  private setupTesseraHoverAndClick(svgElement: SVGElement) {
    const tessere = svgElement.querySelectorAll('[id^="Tessera_"]');
    tessere.forEach(tessera => {
      const tesseraId = parseInt(tessera.id.split('_')[1], 10);
      if (isNaN(tesseraId)) return;

      const el = tessera as SVGElement;
      el.style.cursor = 'pointer';

      el.addEventListener('mouseenter', () => {
        this.evidenziaTessere(this.trovaTessereLimitrofe(tesseraId), true);
      });
      el.addEventListener('mouseleave', () => {
        this.evidenziaTessere(this.trovaTessereLimitrofe(tesseraId), false);
      });
      el.addEventListener('click', (event: Event) => {
        event.stopPropagation();
        this.entraInTessera(tesseraId);
      });
    });
  }

  private evidenziaTessere(tesseraIds: number[], attivo: boolean) {
    tesseraIds.forEach(id => {
      const el = this.svgRootElement?.querySelector(`#Tessera_${id}`) as SVGElement | null;
      if (el) {
        el.style.filter = attivo ? 'brightness(1.3) drop-shadow(0 0 8px #f4c542)' : '';
      }
    });
  }

  // Centroide (spazio root) di una Tessera — media delle posizioni dei suoi punti.
  private centroideTessera(tesseraId: number): { x: number; y: number } | null {
    const puntiIds = this.mapManager.getPuntiPerTessera(this.aree, tesseraId);
    const coords = puntiIds
      .map(id => {
        const el = this.mapManager.svgPointsMap.get(id) as SVGGraphicsElement | undefined;
        if (!el) return null;
        const cx = parseFloat(el.getAttribute('cx') ?? '');
        const cy = parseFloat(el.getAttribute('cy') ?? '');
        if (isNaN(cx) || isNaN(cy)) return null;
        return this.toRootSpace(el, cx, cy);
      })
      .filter((c): c is { x: number; y: number; scale: number } => !!c);
    if (!coords.length) return null;
    return {
      x: coords.reduce((sum, c) => sum + c.x, 0) / coords.length,
      y: coords.reduce((sum, c) => sum + c.y, 0) / coords.length,
    };
  }

  // Tessere limitrofe a una data: le K piu' vicine per distanza tra centroidi (K=6, come i
  // vicini di un esagono) — nessun grafo di adiacenza esiste a livello Tessera (solo a
  // livello Punto, per il movimento), questa e' un'approssimazione geometrica. Includere
  // le limitrofe nello zoom/nell'interattivita' (non solo la Tessera cliccata) da' spazio
  // sufficiente per muoversi anche verso zone confinanti senza dover tornare all'overview
  // — idea dell'utente, risolve lo stesso problema per cui si era pensato ai file di
  // dettaglio con piu' Aree incluse, ma funziona di default senza disegnare nulla a mano.
  private trovaTessereLimitrofe(tesseraId: number, k = 6): number[] {
    const centro = this.centroideTessera(tesseraId);
    if (!centro) return [tesseraId];

    const altre = this.aree
      .flatMap(a => a.tessere)
      .filter(t => t.id !== tesseraId)
      .map(t => ({ id: t.id, centro: this.centroideTessera(t.id) }))
      .filter((t): t is { id: number; centro: { x: number; y: number } } => !!t.centro)
      .map(t => ({ id: t.id, dist: Math.hypot(t.centro.x - centro.x, t.centro.y - centro.y) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, k)
      .map(t => t.id);

    return [tesseraId, ...altre];
  }

  // Calcola il rettangolo viewBox che inquadra un insieme di punti (bounding box in spazio
  // root via toRootSpace, con padding proporzionale — i gruppi piccoli hanno bisogno di
  // piu' margine relativo). Va sempre chiamato con i punti di UNA Tessera, mai di
  // un'intera Area (vedi entraInTessera).
  private calcolaInquadraturaPunti(puntiIds: number[]): { x: number; y: number; width: number; height: number } | null {
    const coords = puntiIds
      .map(id => {
        const el = this.mapManager.svgPointsMap.get(id) as SVGGraphicsElement | undefined;
        if (!el) return null;
        const cx = parseFloat(el.getAttribute('cx') ?? '');
        const cy = parseFloat(el.getAttribute('cy') ?? '');
        if (isNaN(cx) || isNaN(cy)) return null;
        return this.toRootSpace(el, cx, cy);
      })
      .filter((c): c is { x: number; y: number; scale: number } => !!c);

    if (!coords.length) return null;

    const minX = Math.min(...coords.map(c => c.x));
    const maxX = Math.max(...coords.map(c => c.x));
    const minY = Math.min(...coords.map(c => c.y));
    const maxY = Math.max(...coords.map(c => c.y));

    const larghezza = Math.max(maxX - minX, 1);
    const altezza = Math.max(maxY - minY, 1);
    const padding = Math.max(larghezza, altezza) * 1.2 + 60;

    // Tetto minimo di larghezza/altezza (in unita' viewBox): evita uno zoom troppo stretto su
    // una Tessera con pochissimi punti ravvicinati (es. Tessera_1, la barca, che ne ha uno
    // solo). Equivale a non superare ~4x di zoom: si vede la Tessera insieme a un buon
    // contorno di quelle vicine, invece di riempire lo schermo con un singolo esagono.
    const minDim = Math.min(this.viewBoxOverviewIniziale.width, this.viewBoxOverviewIniziale.height) / 4;

    // Centro reale del bounding box: va ricalcolato DOPO il clamp al minimo, altrimenti se
    // larghezza/altezza+padding sono sotto minDim (caso comune: quasi ogni singola Tessera)
    // il box cresce solo verso destra/basso invece di restare centrato — bug reale
    // riscontrato testando (~15% di scarto dal centro della Tessera cliccata).
    const centroX = (minX + maxX) / 2;
    const centroY = (minY + maxY) / 2;
    const width = Math.max(larghezza + padding * 2, minDim);
    const height = Math.max(altezza + padding * 2, minDim);

    return {
      x: centroX - width / 2,
      y: centroY - height / 2,
      width,
      height,
    };
  }

  // Zoom sulla Tessera cliccata (o quella del personaggio in turno, vedi
  // subscribeToGameState) — MAI sul bounding box dell'intera Area, che puo' non essere
  // compatta (es. l'acqua perimetrale) e centrerebbe lo zoom nel vuoto. Se si era gia' su
  // un'altra Tessera (con o senza file di dettaglio caricato), prima si ripristina
  // l'overview per calcolare l'inquadratura corretta, poi si anima la camera.
  async entraInTessera(tesseraId: number) {
    if (this.animandoCamera || (this.cameraState === 'area' && this.activeTesseraId === tesseraId)) return;

    const areaId = this.mapManager.trovaAreaDellaTessera(this.aree, tesseraId);
    if (areaId === null) {
      console.error('Tessera senza Area di appartenenza:', tesseraId);
      return;
    }

    if (this.dettaglioCaricato) {
      await this.ripristinaContenutoOverview();
    } else if (this.cameraState === 'area') {
      // Si stava gia' disegnando direttamente sull'overview zoomata su un'altra Tessera:
      // ripulisce prima di ridisegnare sulla nuova.
      document.querySelectorAll('.punto-hit-area').forEach(el => el.remove());
    }

    // L'inquadratura si calcola SOLO sui punti della Tessera cliccata: includendo anche le
    // limitrofe (bug reale segnalato dall'utente: "clicco una Tessera e non zooma su
    // quella") il centro del bounding box si sposta verso il gruppo intero, specie ai bordi
    // mappa o per Aree con una sola Tessera (es. Area_1), dove le "vicine" vanno cercate in
    // Aree lontane e sbilanciano il centro. Le limitrofe restano usate SOLO per allargare
    // l'insieme di punti interagibili (movimento verso zone confinanti), mai per la camera.
    const puntiTessera = this.mapManager.getPuntiPerTessera(this.aree, tesseraId);
    const tessereScope = this.trovaTessereLimitrofe(tesseraId);
    const puntiScope = new Set(tessereScope.flatMap(id => this.mapManager.getPuntiPerTessera(this.aree, id)));

    const inquadratura = this.calcolaInquadraturaPunti(puntiTessera);
    if (!inquadratura) {
      console.error('Impossibile calcolare l\'inquadratura per la Tessera', tesseraId);
      return;
    }

    this.animandoCamera = true;
    await this.animateCamera(inquadratura);
    this.animandoCamera = false;

    this.cameraState = 'area';
    this.activeAreaId = areaId;
    this.activeTesseraId = tesseraId;
    this.puntiScopeAttivo = puntiScope;
    await this.attivaInterazioneArea(areaId, puntiScope);
  }

  // Attiva l'interattivita' per la Tessera+limitrofe appena inquadrate. Comportamento di
  // default (nessun file esterno necessario): si disegnano ritratti/oggetti/eventi e si
  // registrano le hit-area direttamente sulla mappa overview gia' zoomata — e' vettoriale,
  // ingrandirla non la sgrana. Se esiste un file di dettaglio disegnato a mano per l'Area
  // di appartenenza (arricchimento opzionale, es. per Aree molto dense), lo si carica al
  // suo posto.
  private async attivaInterazioneArea(areaId: number, puntiScope: Set<number>): Promise<void> {
    const path = this.AREA_DETAIL_SVG[areaId];
    if (path) {
      await this.caricaDettaglioOpzionale(areaId, path);
      return;
    }

    this.dettaglioCaricato = false;
    const svgElement = this.getSvgElement();
    if (!svgElement) return;

    this.setupPointClickListeners(svgElement, puntiScope);
    this.drawCharacters();
    this.drawOggettiMappa();
    this.drawEventiMappa();
  }

  // Arricchimento opzionale: sostituisce il contenuto SVG mostrato con un file disegnato a
  // mano per questa Area (stesso meccanismo di loadSvg per map.svg, con cache in memoria).
  private async caricaDettaglioOpzionale(areaId: number, path: string): Promise<void> {
    try {
      const svgText = this.detailSvgCache.get(areaId)
        ?? await firstValueFrom(this.http.get(path, { responseType: 'text' }));
      this.detailSvgCache.set(areaId, svgText);

      this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgText);
      await this.attendiRenderEInizializza(() => this.initializeDettaglio(areaId));

      // Il file di dettaglio ha il suo viewBox: parseViewBox (dentro initializeDettaglio)
      // lo ha gia' impostato come viewBox corrente — il fit nativo e' gia' la vista corretta.
      this.applyViewBox();

      this.dettaglioCaricato = true;
      this.drawCharacters();
      this.drawOggettiMappa();
      this.drawEventiMappa();
    } catch (error) {
      console.error(`Impossibile caricare il dettaglio dell'Area ${areaId}, disegno direttamente sull'overview zoomata`, error);
      this.dettaglioCaricato = false;
      const svgElement = this.getSvgElement();
      if (svgElement && this.puntiScopeAttivo) {
        this.setupPointClickListeners(svgElement, this.puntiScopeAttivo);
        this.drawCharacters();
        this.drawOggettiMappa();
        this.drawEventiMappa();
      }
    }
  }

  // Torna alla mappa overview: se era stato caricato un file di dettaglio opzionale lo
  // scarta e ricarica l'overview (dalla cache in memoria, nessuna nuova richiesta);
  // altrimenti si era gia' sull'overview zoomata, si puliscono solo gli elementi
  // interattivi. Poi anima lo zoom-out verso lo stato iniziale.
  async tornaAOverview() {
    if (this.animandoCamera || this.cameraState !== 'area' || this.activeTesseraId === null) return;

    const puntiScope = this.puntiScopeAttivo ?? new Set(this.mapManager.getPuntiPerTessera(this.aree, this.activeTesseraId));

    if (this.dettaglioCaricato) {
      await this.ripristinaContenutoOverview();
      const inquadratura = this.calcolaInquadraturaPunti([...puntiScope]);
      if (inquadratura) {
        this.viewBox = inquadratura;
        this.applyViewBox();
      }
    } else {
      document.querySelectorAll('.punto-hit-area').forEach(el => el.remove());
    }

    this.animandoCamera = true;
    await this.animateCamera(this.viewBoxOverviewIniziale);
    this.animandoCamera = false;

    document.querySelectorAll('.character-piece, .item-piece, .evento-piece').forEach(el => el.remove());

    this.cameraState = 'overview';
    this.activeAreaId = null;
    this.activeTesseraId = null;
    this.puntiScopeAttivo = null;
    this.dettaglioCaricato = false;
  }

  private async ripristinaContenutoOverview(): Promise<void> {
    if (!this.mapSvgRaw) return;
    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(this.mapSvgRaw);
    await this.attendiRenderEInizializza(() => this.initializeOverview());
  }

  // Tween generico del rettangolo viewBox, adattato dalla vecchia animateZoomPan (mai
  // collegata a nulla prima di questo redesign) — riusato sia per l'ingresso che per
  // l'uscita da una Tessera invece di scrivere due animazioni separate. Anima l'attributo
  // viewBox nativo (non un transform CSS): il motore SVG ridisegna i path vettoriali ad
  // ogni frame a piena risoluzione, niente sgranatura da bitmap scalato.
  private animateCamera(target: { x: number; y: number; width: number; height: number }, durata = 600): Promise<void> {
    return new Promise(resolve => {
      const start = { ...this.viewBox };
      const startTime = Date.now();

      const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / durata, 1);
        const eased = progress * (2 - progress); // ease-out quadratico

        this.viewBox = {
          x: start.x + (target.x - start.x) * eased,
          y: start.y + (target.y - start.y) * eased,
          width: start.width + (target.width - start.width) * eased,
          height: start.height + (target.height - start.height) * eased,
        };
        this.applyViewBox();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      step();
    });
  }

  private applyViewBox() {
    if (!this.svgRootElement) return;
    const { x, y, width, height } = this.viewBox;
    this.svgRootElement.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  }

  // Aggiunge il listener di click ai Punti per il movimento (click-to-move). Il Punto_N
  // nativo ha un raggio minuscolo rispetto al viewBox — si crea per ciascun punto un
  // cerchio trasparente molto piu' grande sovrapposto (hit-area) e i listener si spostano
  // li'. Se puntiIds e' passato, registra solo i punti di quell'insieme (vista di
  // dettaglio scoped a una singola Area).
  private setupPointClickListeners(svgElement: SVGElement, puntiIds?: Set<number>) {
    const points = svgElement.querySelectorAll('[id^="Punto_"]');
    points.forEach(point => {
      const pointId = parseInt(point.id.split('_')[1], 10);
      if (isNaN(pointId)) {
        console.error('Id punto non valido:', point.id);
        return;
      }
      if (puntiIds && !puntiIds.has(pointId)) return;

      const cxLocale = parseFloat(point.getAttribute('cx') ?? '');
      const cyLocale = parseFloat(point.getAttribute('cy') ?? '');
      const ryLocale = parseFloat(point.getAttribute('ry') ?? '0');
      if (isNaN(cxLocale) || isNaN(cyLocale) || !this.overlayGroup) {
        console.error('Punto senza cx/cy, hitbox non creata:', point.id);
        return;
      }

      const rootSpace = this.toRootSpace(point as unknown as SVGGraphicsElement, cxLocale, cyLocale);
      if (!rootSpace) return;

      const hitArea = document.createElementNS(SVG_NS, 'circle');
      hitArea.setAttribute('cx', rootSpace.x.toString());
      hitArea.setAttribute('cy', rootSpace.y.toString());
      hitArea.setAttribute('r', Math.max(ryLocale * rootSpace.scale * 6, 8).toString());
      hitArea.setAttribute('fill', 'transparent');
      hitArea.setAttribute('style', 'pointer-events: all;');
      hitArea.classList.add('punto-hit-area');
      this.overlayGroup.appendChild(hitArea);

      // Evidenzia il punto al passaggio del mouse, solo se non e' bloccato
      hitArea.addEventListener('mouseenter', () => {
        if (!this.isPuntoBloccato(pointId)) {
          (point as HTMLElement).style.filter = 'brightness(1.6) drop-shadow(0 0 4px #00ff88)';
          hitArea.setAttribute('fill', 'rgba(0, 255, 136, 0.12)');
        }
      });
      hitArea.addEventListener('mouseleave', () => {
        (point as HTMLElement).style.filter = '';
        hitArea.setAttribute('fill', 'transparent');
      });

      hitArea.addEventListener('click', (event: Event) => {
        event.stopPropagation();
        this.onPointClick(pointId);
      });
    });

    this.updatePointsHighlighting();
  }

  // Converte coordinate locali (cx,cy di un Punto dentro la sua Area/Tessera, con tutte le
  // trasformazioni annidate del file Inkscape) nello spazio utente della root <svg> — cioe'
  // lo spazio del viewBox, lo stesso in cui vive overlayGroup e in cui si calcolano le
  // inquadrature della camera.
  //
  // NON si puo' usare getCTM(): quella matrice include ANCHE la trasformazione del viewBox
  // corrente, quindi restituisce pixel del viewport, non unita' del viewBox. Dato che la
  // camera modifica il viewBox ad ogni zoom, le coordinate cambiavano ad ogni inquadratura e
  // i calcoli successivi partivano da una base diversa — bug reale: cliccando una Tessera la
  // camera finiva su tutt'altra zona della mappa. Componendo le getScreenCTM() (entrambe
  // relative allo schermo, quindi il contributo del viewBox si annulla nel rapporto) si
  // ottiene la matrice locale->spazio-viewBox, stabile a qualunque livello di zoom.
  private toRootSpace(elemento: SVGGraphicsElement, localX: number, localY: number): { x: number; y: number; scale: number } | null {
    const rootScreenCtm = this.svgRootElement
      ? (this.svgRootElement as unknown as SVGGraphicsElement).getScreenCTM()
      : null;
    const elementoScreenCtm = elemento.getScreenCTM();
    if (!rootScreenCtm || !elementoScreenCtm) return null;

    const ctm = rootScreenCtm.inverse().multiply(elementoScreenCtm);
    const punto = new DOMPoint(localX, localY).matrixTransform(ctm);
    const scale = Math.sqrt(Math.abs(ctm.a * ctm.d - ctm.b * ctm.c));
    return { x: punto.x, y: punto.y, scale };
  }

  // Punto bloccato = non ci si puo' muovere li' (campo Blocco lato backend)
  private isPuntoBloccato(pointId: number): boolean {
    return this.punti.find(p => p.id === pointId)?.blocco ?? false;
  }

  // Applica cursore/opacita' a tutti i punti registrati in base a Blocco: distingue
  // visivamente i punti raggiungibili da quelli bloccati, invece di scoprirlo solo dopo
  // aver cliccato. Stili inline (non classi CSS) perche' l'SVG e' iniettato via innerHTML.
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
      next: (missione: Missione) => {
        if (missione?.stato === StatoMissione.Interrotta) {
          alert(this.messaggioMovimentoInterrotto(missione, pointId));
          return;
        }
        this.triggerEventoSeArrivato(pointId);
      },
      // Il backend ora risponde con il motivo reale del rifiuto (ingaggiato da un nemico,
      // nessun percorso, gia' su quella casella): mostrarlo invece di seppellirlo in
      // console — altrimenti il giocatore vede solo il personaggio che non si muove e non
      // sa se ha sbagliato bersaglio o se il gioco lo sta bloccando apposta.
      error: (error) => {
        console.error('Errore durante il movimento verso il punto', pointId, error);
        alert(error?.error?.message ?? 'Non e\' stato possibile spostarsi su questa casella.');
      }
    });
  }

  // Un movimento interrotto ha due cause diverse e il giocatore deve poterle distinguere:
  // o si e' entrati nella tessera di un nemico (per regolamento ci si entra e ci si ferma
  // li', non si viene respinti), oppure sono finiti i punti movimento prima di arrivare.
  private messaggioMovimentoInterrotto(missione: Missione, destinazione: number): string {
    const posizioneFinale = missione?.personaggio?.posizione ?? this.characterInTurno?.posizione;

    if (posizioneFinale !== undefined && this.nemicoVivoNellaTesseraDi(posizioneFinale)) {
      return 'Sei entrato nel raggio d\'azione di un nemico e ti sei fermato li\'. Finche\' e\' vivo non puoi piu\' muoverti: puoi attaccarlo, usare un oggetto o tentare la fuga.';
    }

    if (posizioneFinale !== destinazione) {
      return 'Punti movimento esauriti: ti sei fermato lungo il percorso. Usa un\'altra azione per proseguire.';
    }

    return 'Movimento interrotto.';
  }

  // L'ingaggio vale per l'intera Tessera, non per la singola casella (stessa regola del
  // backend, MissionHandler.NemiciNellaTessera): un nemico gia' sconfitto non ingaggia.
  private nemicoVivoNellaTesseraDi(posizione: number): boolean {
    const tesseraId = this.punti.find(p => p.id === posizione)?.id_Tessera;
    if (tesseraId === undefined) return false;

    const puntiDellaTessera = new Set(
      this.punti.filter(p => p.id_Tessera === tesseraId).map(p => p.id)
    );

    return this.characters.some(c =>
      (c.tipoPersonaggio === TipoPersonaggio.NemicoPersonaggio || c.tipoPersonaggio === TipoPersonaggio.NemicoNPC)
      && c.punti_Vita > 0
      && puntiDellaTessera.has(c.posizione)
    );
  }

  // Se il punto appena raggiunto e' un trigger Probabilita'/Imprevisto (EventoMappa), apre
  // subito la pagina che pesca ed espone la carta.
  private triggerEventoSeArrivato(pointId: number) {
    const evento = this.eventiMappa.find(e => e.idPunto === pointId);
    if (!evento) {
      return;
    }
    const rotta = evento.tipo === TipoOggetto.Probabilita ? '/probabilita' : '/imprevisti';
    this.router.navigateByUrl(rotta);
  }

  // Aggiorna subscription
  private subscribeToGameState() {
    this.gameState.gameState$.subscribe(state => {
      if (state) {
        this.mapManager.updateState(state.personaggi, state.punti);
        this.aree = state.aree ?? [];
        this.itemsMappa = state.inventari?.find(i => i.tipo === TipoInventario.Mappa)?.oggetti ?? [];
        this.eventiMappa = state.eventiMappa ?? [];
        this.drawOggettiMappa();
        this.drawEventiMappa();
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

    // Zoom automatico sulla Tessera del personaggio quando inizia il suo turno (in aggiunta
    // al click manuale su un'Area in overview) — solo al cambio di personaggio in turno,
    // non ad ogni poll, e nessun effetto se la camera e' gia' su quella Tessera.
    this.gameState.characterInTurno$.subscribe(async c => {
      const cambiato = this.characterInTurno?.id !== c?.id;
      this.characterInTurno = c;
      if (cambiato && c) {
        await this.mappaPronta;
        const tesseraId = this.punti.find(p => p.id === c.posizione)?.id_Tessera;
        if (tesseraId !== undefined) {
          this.entraInTessera(tesseraId);
        }
      }
    });
  }

  // Dimensione minima di un ritratto sulla mappa: coerente con il raggio dell'hit-area
  // allargata (Math.max(ry*6, 8)), cosi' il ritratto riempie visivamente la zona
  // cliccabile invece di essere un puntino sperso al centro.
  private readonly DIMENSIONE_PEDINA_MIN = 16;

  // Punti interagibili nella vista corrente: null in overview (niente disegnato li'), la
  // Tessera attiva + limitrofe quando si e' zoomati sulla mappa overview (caso di default,
  // vedi puntiScopeAttivo/trovaTessereLimitrofe), oppure tutti i punti del file di
  // dettaglio opzionale se ne e' stato caricato uno.
  private puntiInteragibili(): Set<number> | null {
    if (this.cameraState !== 'area') return null;
    if (this.dettaglioCaricato) {
      // File di dettaglio opzionale: interagibile tutto cio' che e' effettivamente presente
      // nel file (puo' includere punti di Aree confinanti), non solo quelli "ufficialmente"
      // di questa Area secondo i dati di gioco.
      return new Set(this.mapManager.svgPointsMap.keys());
    }
    return this.puntiScopeAttivo;
  }

  // Disegna un ritratto (resolvePersonaggioImage) per ciascun personaggio nell'Area di
  // dettaglio attiva, con bordo verde/rosso alleato/nemico e disposizione a ventaglio se
  // piu' personaggi condividono un punto.
  private drawCharacters() {
    document.querySelectorAll('.character-piece').forEach(el => el.remove());

    const overlay = this.overlayGroup;
    const puntiAttivi = this.puntiInteragibili();
    if (!overlay || !puntiAttivi) return;

    const perPunto = new Map<number, Personaggio[]>();
    this.characters.forEach(char => {
      if (!puntiAttivi.has(char.posizione)) return;
      const lista = perPunto.get(char.posizione) ?? [];
      lista.push(char);
      perPunto.set(char.posizione, lista);
    });

    perPunto.forEach((occupanti, pointId) => {
      const pointElement = this.mapManager.svgPointsMap.get(pointId) as SVGEllipseElement;
      if (!pointElement) return;

      const cxLocale = parseFloat(pointElement.getAttribute('cx') ?? '');
      const cyLocale = parseFloat(pointElement.getAttribute('cy') ?? '');
      const ryLocale = parseFloat(pointElement.getAttribute('ry') ?? '');
      if (isNaN(cxLocale) || isNaN(cyLocale) || isNaN(ryLocale)) {
        console.error('Pedina non disegnata perché svg del punto non ha cx/cy/ry');
        return;
      }

      const rootSpace = this.toRootSpace(pointElement, cxLocale, cyLocale);
      if (!rootSpace) return;
      const { x: cx, y: cy, scale } = rootSpace;

      const dimensione = Math.max(ryLocale * scale * 6, this.DIMENSIONE_PEDINA_MIN);

      occupanti.forEach((char, index) => {
        const offset = this.calcolaOffsetVentaglio(index, occupanti.length, dimensione);

        const g = document.createElementNS(SVG_NS, 'g');
        g.classList.add('character-piece');
        g.setAttribute('style', 'pointer-events: all;');
        g.setAttribute('transform', `translate(${cx + offset.dx}, ${cy + offset.dy})`);

        const sfondo = document.createElementNS(SVG_NS, 'circle');
        sfondo.setAttribute('r', (dimensione / 2 + 1).toString());
        sfondo.setAttribute('fill', this.isNemico(char) ? '#b33a3a' : '#2f8f5b');
        g.appendChild(sfondo);

        const img = document.createElementNS(SVG_NS, 'image');
        img.setAttribute('href', resolvePersonaggioImage(char));
        img.setAttribute('x', (-dimensione / 2).toString());
        img.setAttribute('y', (-dimensione / 2).toString());
        img.setAttribute('width', dimensione.toString());
        img.setAttribute('height', dimensione.toString());
        img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        g.appendChild(img);

        if (this.isNemico(char)) {
          g.style.cursor = 'crosshair';
          g.addEventListener('click', (event: Event) => {
            event.stopPropagation();
            this.onCharacterPieceClick(char);
          });
        }

        overlay.appendChild(g);
      });
    });
  }

  // Dispone N elementi centrati su un punto: 1 solo elemento resta al centro, 2+ vengono
  // messi su un cerchio attorno al centro per non sovrapporsi. Il raggio cresce con il
  // numero di occupanti: la circonferenza deve poter contenere "totale" elementi
  // affiancati larghi "dimensione".
  private calcolaOffsetVentaglio(index: number, totale: number, dimensione: number): { dx: number; dy: number } {
    if (totale <= 1) {
      return { dx: 0, dy: 0 };
    }
    const raggioVentaglio = Math.max(dimensione * 0.5, (dimensione * totale) / (2 * Math.PI));
    const angolo = (2 * Math.PI * index) / totale;
    return { dx: Math.cos(angolo) * raggioVentaglio, dy: Math.sin(angolo) * raggioVentaglio };
  }

  // Icone degli oggetti piazzati sulla mappa (Oggetto.id_Posizione, Inventario Tipo=Mappa),
  // solo nell'Area di dettaglio attiva.
  private drawOggettiMappa() {
    document.querySelectorAll('.item-piece').forEach(el => el.remove());

    const overlay = this.overlayGroup;
    const puntiAttivi = this.puntiInteragibili();
    if (!overlay || !puntiAttivi) return;

    const perPunto = new Map<number, OggettoInventario[]>();
    this.itemsMappa.forEach(voce => {
      const posizione = voce.oggetto.id_Posizione;
      if (posizione == null || !puntiAttivi.has(posizione)) return;
      const lista = perPunto.get(posizione) ?? [];
      lista.push(voce);
      perPunto.set(posizione, lista);
    });

    perPunto.forEach((voci, pointId) => {
      const pointElement = this.mapManager.svgPointsMap.get(pointId) as SVGEllipseElement;
      if (!pointElement) return;

      const cxLocale = parseFloat(pointElement.getAttribute('cx') ?? '');
      const cyLocale = parseFloat(pointElement.getAttribute('cy') ?? '');
      const ryLocale = parseFloat(pointElement.getAttribute('ry') ?? '');
      if (isNaN(cxLocale) || isNaN(cyLocale) || isNaN(ryLocale)) return;

      const rootSpace = this.toRootSpace(pointElement, cxLocale, cyLocale);
      if (!rootSpace) return;
      const { x: cx, y: cy, scale } = rootSpace;

      const dimensione = Math.max(ryLocale * scale * 4, this.DIMENSIONE_PEDINA_MIN * 0.75);

      voci.forEach((voce, index) => {
        const offset = this.calcolaOffsetVentaglio(index, voci.length, dimensione * 1.5);

        const img = document.createElementNS(SVG_NS, 'image');
        img.classList.add('item-piece');
        img.setAttribute('href', resolveOggettoImage(voce.oggetto.id));
        img.setAttribute('x', (cx + offset.dx - dimensione / 2).toString());
        img.setAttribute('y', (cy + offset.dy - dimensione / 2).toString());
        img.setAttribute('width', dimensione.toString());
        img.setAttribute('height', dimensione.toString());
        img.setAttribute('style', 'pointer-events: none;');
        overlay.appendChild(img);
      });
    });
  }

  // Marker per i punti mappa assegnati come trigger Probabilita'/Imprevisto (EventoMappa),
  // solo nell'Area di dettaglio attiva. Nessun nuovo asset grafico: un cerchio colorato
  // con un simbolo di testo (? / !) basta a distinguerli.
  private drawEventiMappa() {
    document.querySelectorAll('.evento-piece').forEach(el => el.remove());

    const overlay = this.overlayGroup;
    const puntiAttivi = this.puntiInteragibili();
    if (!overlay || !puntiAttivi) return;

    this.eventiMappa.forEach(evento => {
      if (!puntiAttivi.has(evento.idPunto)) return;
      const pointElement = this.mapManager.svgPointsMap.get(evento.idPunto) as SVGEllipseElement;
      if (!pointElement) return;

      const cxLocale = parseFloat(pointElement.getAttribute('cx') ?? '');
      const cyLocale = parseFloat(pointElement.getAttribute('cy') ?? '');
      const ryLocale = parseFloat(pointElement.getAttribute('ry') ?? '');
      if (isNaN(cxLocale) || isNaN(cyLocale) || isNaN(ryLocale)) return;

      const rootSpace = this.toRootSpace(pointElement, cxLocale, cyLocale);
      if (!rootSpace) return;
      const { x: cx, y: cy, scale } = rootSpace;

      const dimensione = Math.max(ryLocale * scale * 5, this.DIMENSIONE_PEDINA_MIN * 0.9);
      const eProbabilita = evento.tipo === TipoOggetto.Probabilita;

      const g = document.createElementNS(SVG_NS, 'g');
      g.classList.add('evento-piece');
      g.setAttribute('style', 'pointer-events: none;');
      g.setAttribute('transform', `translate(${cx}, ${cy})`);

      const cerchio = document.createElementNS(SVG_NS, 'circle');
      cerchio.setAttribute('r', (dimensione / 2).toString());
      cerchio.setAttribute('fill', eProbabilita ? '#2f6f8f' : '#8f5a2f');
      cerchio.setAttribute('stroke', '#f4e4c1');
      cerchio.setAttribute('stroke-width', '1');
      g.appendChild(cerchio);

      const testo = document.createElementNS(SVG_NS, 'text');
      testo.textContent = eProbabilita ? '?' : '!';
      testo.setAttribute('text-anchor', 'middle');
      testo.setAttribute('dominant-baseline', 'central');
      testo.setAttribute('font-size', (dimensione * 0.6).toString());
      testo.setAttribute('font-weight', 'bold');
      testo.setAttribute('fill', '#f4e4c1');
      g.appendChild(testo);

      overlay.appendChild(g);
    });
  }

  private isNemico(char: Personaggio): boolean {
    return char.tipoPersonaggio === TipoPersonaggio.NemicoNPC
        || char.tipoPersonaggio === TipoPersonaggio.NemicoPersonaggio;
  }

  // Click su un pezzo nemico sulla mappa: apre il combat-modal. Niente gate di posizione:
  // MissionHandler ferma deliberatamente il movimento PRIMA di entrare nella tessera di un
  // nemico, quindi in gioco normale il personaggio non condivide mai la stessa posizione
  // esatta di un nemico — e AttaccoHandler lato server non valida gittata/distanza.
  private onCharacterPieceClick(nemico: Personaggio) {
    if (!this.characterInTurno) {
      return;
    }

    const combattimentiCoinvolti = this.gameState.getCombattimentiAttivi().filter(c =>
      c.listaEroi.includes(this.characterInTurno!.id) || c.listaNPCs.includes(this.characterInTurno!.id) ||
      c.listaEroi.includes(nemico.id) || c.listaNPCs.includes(nemico.id)
    );
    const combattimentoMultiplo = combattimentiCoinvolti.some(c => c.listaEroi.length > 1 || c.listaNPCs.length > 1);
    if (combattimentoMultiplo) {
      alert('Combattimento multiplo non ancora supportato in questa schermata.');
      return;
    }

    this.gameState.setCombatTarget({ attaccante: this.characterInTurno, attaccato: nemico });
  }

  getCharacterPosition(char: any) {
    const coords = this.mapManager.getPointCoordinates(char.posizione);
    if (!coords) {
      console.warn(`Coordinate non trovate per il personaggio in posizione ${char.posizione}`);
    }
    return coords;
  }

  // Stato neutro della camera: il viewBox nativo dell'overview appena caricata, gia'
  // impostato da initializeOverview/parseViewBox — questa e' quindi la vista overview di
  // base a cui si torna con "Torna alla mappa".
  private centerMap() {
    this.viewBox = { ...this.viewBoxOverviewIniziale };
    this.applyViewBox();
  }
}
