import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedBannerComponent } from './animated-banner.component';

describe('AnimatedBannerComponent', () => {
  let component: AnimatedBannerComponent;
  let fixture: ComponentFixture<AnimatedBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimatedBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimatedBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
