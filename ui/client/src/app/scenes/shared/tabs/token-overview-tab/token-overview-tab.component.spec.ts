import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenOverviewTabComponent } from './token-overview-tab.component';

describe('TokenOverviewComponent', () => {
  let component: TokenOverviewTabComponent;
  let fixture: ComponentFixture<TokenOverviewTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokenOverviewTabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenOverviewTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
