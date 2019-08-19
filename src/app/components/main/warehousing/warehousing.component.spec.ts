import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehousingComponent } from './warehousing.component';

describe('WarehousingComponent', () => {
  let component: WarehousingComponent;
  let fixture: ComponentFixture<WarehousingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehousingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehousingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
