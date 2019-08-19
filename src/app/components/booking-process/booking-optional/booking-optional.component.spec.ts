import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingOptionalComponent } from './booking-optional.component';

describe('BookingOptionalComponent', () => {
  let component: BookingOptionalComponent;
  let fixture: ComponentFixture<BookingOptionalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookingOptionalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingOptionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
