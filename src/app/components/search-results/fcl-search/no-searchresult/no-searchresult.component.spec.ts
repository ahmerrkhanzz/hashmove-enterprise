import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoSearchresultComponent } from './no-searchresult.component';

describe('NoSearchresultComponent', () => {
  let component: NoSearchresultComponent;
  let fixture: ComponentFixture<NoSearchresultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoSearchresultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoSearchresultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
