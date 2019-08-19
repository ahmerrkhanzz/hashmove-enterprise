import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContTrackMonComponent } from './cont-track-mon.component';

describe('ContTrackMonComponent', () => {
  let component: ContTrackMonComponent;
  let fixture: ComponentFixture<ContTrackMonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContTrackMonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContTrackMonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
