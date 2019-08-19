import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HashFiltersSidebarComponent } from './hash-filters-sidebar.component';

describe('HashFiltersSidebarComponent', () => {
  let component: HashFiltersSidebarComponent;
  let fixture: ComponentFixture<HashFiltersSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HashFiltersSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HashFiltersSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
