import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaggiComponent } from './personaggi.component';

describe('PersonaggiComponent', () => {
  let component: PersonaggiComponent;
  let fixture: ComponentFixture<PersonaggiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PersonaggiComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PersonaggiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
