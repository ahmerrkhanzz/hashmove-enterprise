import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBookingTableComponent } from './view-booking-table.component';

describe('ViewBookingTableComponent', () => {
  let component: ViewBookingTableComponent;
  let fixture: ComponentFixture<ViewBookingTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBookingTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBookingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
