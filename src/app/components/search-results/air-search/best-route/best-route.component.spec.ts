import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BestRouteComponent } from './best-route.component';

describe('BestRouteComponent', () => {
  let component: BestRouteComponent;
  let fixture: ComponentFixture<BestRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BestRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
