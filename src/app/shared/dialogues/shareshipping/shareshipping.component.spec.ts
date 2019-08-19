import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareshippingComponent } from './shareshipping.component';

describe('ShareshippingComponent', () => {
  let component: ShareshippingComponent;
  let fixture: ComponentFixture<ShareshippingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareshippingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareshippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
