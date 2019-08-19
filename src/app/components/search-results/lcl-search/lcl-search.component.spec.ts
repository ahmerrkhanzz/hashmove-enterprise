import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LclSearchComponent } from './lcl-search.component';

describe('LclSearchComponent', () => {
  let component: LclSearchComponent;
  let fixture: ComponentFixture<LclSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LclSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LclSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
