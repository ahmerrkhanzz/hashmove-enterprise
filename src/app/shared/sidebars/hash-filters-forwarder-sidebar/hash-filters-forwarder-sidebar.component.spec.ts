import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HashFiltersForwarderSidebarComponent } from './hash-filters-forwarder-sidebar.component';

describe('HashFiltersForwarderSidebarComponent', () => {
  let component: HashFiltersForwarderSidebarComponent;
  let fixture: ComponentFixture<HashFiltersForwarderSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HashFiltersForwarderSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HashFiltersForwarderSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
