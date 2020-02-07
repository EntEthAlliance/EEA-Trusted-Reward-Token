import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsTabComponent } from './requests-tab.component';

describe('RequestsComponent', () => {
  let component: RequestsTabComponent;
  let fixture: ComponentFixture<RequestsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RequestsTabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
