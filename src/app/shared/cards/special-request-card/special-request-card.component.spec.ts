import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialRequestCardComponent } from './special-request-card.component';

describe('SpecialRequestCardComponent', () => {
  let component: SpecialRequestCardComponent;
  let fixture: ComponentFixture<SpecialRequestCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialRequestCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialRequestCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
