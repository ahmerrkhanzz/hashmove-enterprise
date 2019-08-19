import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirFreightForwardersComponent } from './air-freight-forwarders.component';

describe('AirFreightForwardersComponent', () => {
  let component: AirFreightForwardersComponent;
  let fixture: ComponentFixture<AirFreightForwardersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirFreightForwardersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirFreightForwardersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
