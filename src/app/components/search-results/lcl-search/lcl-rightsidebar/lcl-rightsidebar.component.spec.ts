import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LclRightsidebarComponent } from './lcl-rightsidebar.component';

describe('LclRightsidebarComponent', () => {
  let component: LclRightsidebarComponent;
  let fixture: ComponentFixture<LclRightsidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LclRightsidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LclRightsidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
