import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchingComponent } from './fetching.component';

describe('FetchingComponent', () => {
  let component: FetchingComponent;
  let fixture: ComponentFixture<FetchingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FetchingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FetchingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
