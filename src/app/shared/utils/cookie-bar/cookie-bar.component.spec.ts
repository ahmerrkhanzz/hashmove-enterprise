import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieBarComponent } from './cookie-bar.component';

describe('CookieBarComponent', () => {
  let component: CookieBarComponent;
  let fixture: ComponentFixture<CookieBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CookieBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CookieBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
