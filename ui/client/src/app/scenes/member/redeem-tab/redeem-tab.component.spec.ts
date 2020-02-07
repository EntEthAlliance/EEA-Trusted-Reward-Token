import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemTabComponent } from './redeem-tab.component';

describe('RedeemComponent', () => {
  let component: RedeemTabComponent;
  let fixture: ComponentFixture<RedeemTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RedeemTabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedeemTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
