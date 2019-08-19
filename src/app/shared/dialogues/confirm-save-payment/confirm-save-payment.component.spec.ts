import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmSavePaymentComponent } from './confirm-save-payment.component';

describe('ConfirmSavePaymentComponent', () => {
  let component: ConfirmSavePaymentComponent;
  let fixture: ComponentFixture<ConfirmSavePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmSavePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmSavePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
