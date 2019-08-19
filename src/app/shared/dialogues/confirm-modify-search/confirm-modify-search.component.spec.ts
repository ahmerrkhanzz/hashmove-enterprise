import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmModifySearchComponent } from './confirm-modify-search.component';

describe('ConfirmModifySearchComponent', () => {
  let component: ConfirmModifySearchComponent;
  let fixture: ComponentFixture<ConfirmModifySearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmModifySearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmModifySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
