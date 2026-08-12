// map-manager.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Area, Punto } from '../../dto/game';
import { Personaggio } from '../../dto/personaggio';

@Injectable({
  providedIn: 'root'
})
export class MapManagerService {
  svgPointsMap = new Map<number, SVGElement>();
  
  private charactersSubject = new BehaviorSubject<Personaggio[]>([]);
  private pointsSubject = new BehaviorSubject<Punto[]>([]);

  characters$ = this.charactersSubject.asObservable();
  points$ = this.pointsSubject.asObservable();

  registerSvgPoints(svgElement: SVGElement) {
    const points = svgElement.querySelectorAll('[id^="Punto_"]');
    points.forEach(point => {
      const pointId = parseInt(point.id.split('_')[1]);
      this.svgPointsMap.set(pointId, point as SVGElement);
    });
    console.log('Punti SVG registrati:', Array.from(this.svgPointsMap.keys()));
  }

  updateState(characters: Personaggio[], points: Punto[]) {
    this.charactersSubject.next(characters);
    this.pointsSubject.next(points);
  }

  getPointCoordinates(pointId: number): {x: number, y: number} | null {
    const point = this.svgPointsMap.get(pointId);
    if (!point) return null;

    // Cast corretto per SVGGraphicsElement che ha getBBox()
    const svgPoint = point as unknown as SVGGraphicsElement;
    const bbox = svgPoint.getBBox();
    
    return {
      x: bbox.x + bbox.width/2,
      y: bbox.y + bbox.height/2
    };
  }

  // Appartenenza Punto->Area, derivata dalla gerarchia gia' annidata che il backend restituisce
  // (Area.tessere[].punti[] — vedi GetUpdatePartitaSoft) invece di ricostruire i join a mano su
  // punti/tessere separati. Usata per: quali punti disegnare/rendere cliccabili quando si entra
  // in un'Area (mappa.component.ts), e per il badge overview (nemico/oggetto/evento presente).
  buildPuntoAreaMap(aree: Area[]): Map<number, number> {
    const mappa = new Map<number, number>();
    aree.forEach(area => {
      area.tessere.forEach(tessera => {
        tessera.punti.forEach(punto => {
          mappa.set(punto.id, area.id);
        });
      });
    });
    return mappa;
  }

  getPuntiPerArea(aree: Area[], areaId: number): number[] {
    const result: number[] = [];
    aree.forEach(area => {
      if (area.id !== areaId) return;
      area.tessere.forEach(tessera => {
        tessera.punti.forEach(punto => result.push(punto.id));
      });
    });
    return result;
  }

  // Punti di una singola Tessera (non dell'intera Area): usati per calcolare l'inquadratura
  // dello zoom. Un'Area puo' non essere geometricamente compatta (es. l'acqua che avvolge
  // tutta la mappa lungo il perimetro) — il centro del bounding box di TUTTI i suoi punti
  // può cadere nel vuoto al centro mappa invece che su un punto reale. Una Tessera invece è
  // sempre un piccolo cluster fisicamente compatto (un solo esagono), quindi e' l'unita'
  // giusta per centrare la camera — bug reale segnalato dall'utente dopo un test dal vivo.
  getPuntiPerTessera(aree: Area[], tesseraId: number): number[] {
    for (const area of aree) {
      const tessera = area.tessere.find(t => t.id === tesseraId);
      if (tessera) return tessera.punti.map(p => p.id);
    }
    return [];
  }

  trovaAreaDellaTessera(aree: Area[], tesseraId: number): number | null {
    for (const area of aree) {
      if (area.tessere.some(t => t.id === tesseraId)) return area.id;
    }
    return null;
  }
}