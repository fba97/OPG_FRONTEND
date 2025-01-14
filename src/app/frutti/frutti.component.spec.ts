import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FruttiComponent } from './frutti.component';

describe('FruttiComponent', () => {
  let component: FruttiComponent;
  let fixture: ComponentFixture<FruttiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FruttiComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FruttiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
