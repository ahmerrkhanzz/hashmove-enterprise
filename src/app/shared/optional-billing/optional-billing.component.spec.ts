import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionalBillingComponent } from './optional-billing.component';

describe('OptionalBillingComponent', () => {
  let component: OptionalBillingComponent;
  let fixture: ComponentFixture<OptionalBillingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionalBillingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionalBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
