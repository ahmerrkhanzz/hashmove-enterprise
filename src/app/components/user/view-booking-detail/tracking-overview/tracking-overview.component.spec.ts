import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingOverviewComponent } from './tracking-overview.component';

describe('TrackingOverviewComponent', () => {
  let component: TrackingOverviewComponent;
  let fixture: ComponentFixture<TrackingOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackingOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
