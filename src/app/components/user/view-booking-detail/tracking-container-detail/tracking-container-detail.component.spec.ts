import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingContainerDetailComponent } from './tracking-container-detail.component';

describe('TrackingContainerDetailComponent', () => {
  let component: TrackingContainerDetailComponent;
  let fixture: ComponentFixture<TrackingContainerDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackingContainerDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackingContainerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
