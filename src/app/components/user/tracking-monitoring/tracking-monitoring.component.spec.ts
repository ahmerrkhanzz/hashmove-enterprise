import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingMonitoringComponent } from './tracking-monitoring.component';

describe('TrackingMonitoringComponent', () => {
  let component: TrackingMonitoringComponent;
  let fixture: ComponentFixture<TrackingMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackingMonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackingMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
