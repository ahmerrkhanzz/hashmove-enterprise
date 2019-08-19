import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifyVendorComponent } from './notify-vendor.component';

describe('NotifyVendorComponent', () => {
  let component: NotifyVendorComponent;
  let fixture: ComponentFixture<NotifyVendorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotifyVendorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifyVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
