import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBookingCardComponent } from './view-booking-card.component';

describe('ViewBookingCardComponent', () => {
  let component: ViewBookingCardComponent;
  let fixture: ComponentFixture<ViewBookingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBookingCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBookingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
