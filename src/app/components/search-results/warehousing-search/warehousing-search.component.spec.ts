import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehousingSearchComponent } from './warehousing-search.component';

describe('WarehousingSearchComponent', () => {
  let component: WarehousingSearchComponent;
  let fixture: ComponentFixture<WarehousingSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehousingSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehousingSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
