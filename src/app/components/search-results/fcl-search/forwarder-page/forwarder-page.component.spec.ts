import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForwarderPageComponent } from './forwarder-page.component';

describe('ForwarderPageComponent', () => {
  let component: ForwarderPageComponent;
  let fixture: ComponentFixture<ForwarderPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForwarderPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForwarderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
