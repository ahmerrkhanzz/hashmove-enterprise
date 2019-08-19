import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableCookiesComponent } from './enable-cookies.component';

describe('EnableCookiesComponent', () => {
  let component: EnableCookiesComponent;
  let fixture: ComponentFixture<EnableCookiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnableCookiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnableCookiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
