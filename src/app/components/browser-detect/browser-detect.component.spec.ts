import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserDetectComponent } from './browser-detect.component';

describe('BrowserDetectComponent', () => {
  let component: BrowserDetectComponent;
  let fixture: ComponentFixture<BrowserDetectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowserDetectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserDetectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
