import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HashCardComponent } from './hash-search-card.component';

describe('HashCardComponent', () => {
  let component: HashCardComponent;
  let fixture: ComponentFixture<HashCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HashCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HashCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
