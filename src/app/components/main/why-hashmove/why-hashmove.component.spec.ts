import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyHashmoveComponent } from './why-hashmove.component';

describe('WhyHashmoveComponent', () => {
  let component: WhyHashmoveComponent;
  let fixture: ComponentFixture<WhyHashmoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhyHashmoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhyHashmoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
