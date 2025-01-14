import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DettagliocombattimentoComponent } from './dettagliocombattimento.component';

describe('DettagliocombattimentoComponent', () => {
  let component: DettagliocombattimentoComponent;
  let fixture: ComponentFixture<DettagliocombattimentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DettagliocombattimentoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DettagliocombattimentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
