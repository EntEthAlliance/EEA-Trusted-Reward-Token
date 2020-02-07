import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesTabComponent } from './employees-tab.component';

describe('EmployeesTabComponent', () => {
  let component: EmployeesTabComponent;
  let fixture: ComponentFixture<EmployeesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeesTabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
