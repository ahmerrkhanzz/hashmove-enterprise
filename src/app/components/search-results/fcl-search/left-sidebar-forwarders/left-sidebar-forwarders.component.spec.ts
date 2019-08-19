import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftSidebarForwardersComponent } from './left-sidebar-forwarders.component';

describe('LeftSidebarForwardersComponent', () => {
  let component: LeftSidebarForwardersComponent;
  let fixture: ComponentFixture<LeftSidebarForwardersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftSidebarForwardersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftSidebarForwardersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
