import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LclLeftSidebarComponent } from './lcl-left-sidebar.component';

describe('LclLeftSidebarComponent', () => {
  let component: LclLeftSidebarComponent;
  let fixture: ComponentFixture<LclLeftSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LclLeftSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LclLeftSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
