import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbabilitaComponent } from './probabilita.component';

describe('ProbabilitaComponent', () => {
  let component: ProbabilitaComponent;
  let fixture: ComponentFixture<ProbabilitaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProbabilitaComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProbabilitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
