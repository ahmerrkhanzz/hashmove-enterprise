import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmSwitchContainersComponent } from './confirm-switch-containers.component';

describe('ConfirmSwitchContainersComponent', () => {
  let component: ConfirmSwitchContainersComponent;
  let fixture: ComponentFixture<ConfirmSwitchContainersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmSwitchContainersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmSwitchContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
