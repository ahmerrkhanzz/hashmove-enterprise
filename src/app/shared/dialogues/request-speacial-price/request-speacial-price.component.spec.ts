import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestSpeacialPriceComponent } from './request-speacial-price.component';

describe('RequestSpeacialPriceComponent', () => {
  let component: RequestSpeacialPriceComponent;
  let fixture: ComponentFixture<RequestSpeacialPriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestSpeacialPriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestSpeacialPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
