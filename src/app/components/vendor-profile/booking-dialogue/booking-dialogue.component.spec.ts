import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingDialogueComponent } from './booking-dialogue.component';

describe('BookingDialogueComponent', () => {
  let component: BookingDialogueComponent;
  let fixture: ComponentFixture<BookingDialogueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookingDialogueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
