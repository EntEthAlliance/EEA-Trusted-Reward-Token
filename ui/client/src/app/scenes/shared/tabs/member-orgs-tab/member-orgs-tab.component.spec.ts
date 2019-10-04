import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberOrgsTabComponent } from './member-orgs-tab.component';

describe('MemberOrgsTabComponent', () => {
  let component: MemberOrgsTabComponent;
  let fixture: ComponentFixture<MemberOrgsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MemberOrgsTabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberOrgsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
