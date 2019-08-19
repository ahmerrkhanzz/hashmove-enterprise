import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UspSectionComponent } from './usp-section.component';

describe('UspSectionComponent', () => {
  let component: UspSectionComponent;
  let fixture: ComponentFixture<UspSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UspSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UspSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
