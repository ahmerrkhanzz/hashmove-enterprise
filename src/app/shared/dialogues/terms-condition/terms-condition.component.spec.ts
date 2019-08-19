import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsConditDialogComponent } from './terms-condition.component';

describe('TermsConditDialogComponent', () => {
  let component: TermsConditDialogComponent;
  let fixture: ComponentFixture<TermsConditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TermsConditDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsConditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
