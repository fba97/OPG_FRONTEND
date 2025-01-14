import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprevistiComponent } from './imprevisti.component';

describe('ImprevistiComponent', () => {
  let component: ImprevistiComponent;
  let fixture: ComponentFixture<ImprevistiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImprevistiComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ImprevistiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
