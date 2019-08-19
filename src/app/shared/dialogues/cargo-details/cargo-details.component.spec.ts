import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CargoDetailsComponent } from './cargo-details.component';

describe('CargoDetailsComponent', () => {
  let component: CargoDetailsComponent;
  let fixture: ComponentFixture<CargoDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CargoDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CargoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
