// map-manager.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Punto } from '../../dto/game';
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
}