import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombattimentoComponent } from './combattimento.component';

describe('CombattimentoComponent', () => {
  let component: CombattimentoComponent;
  let fixture: ComponentFixture<CombattimentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CombattimentoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CombattimentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
