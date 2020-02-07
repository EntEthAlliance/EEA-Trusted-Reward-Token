import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenIssuanceTabComponent } from './token-issuance-tab.component';

describe('TokenIssuanceComponent', () => {
  let component: TokenIssuanceTabComponent;
  let fixture: ComponentFixture<TokenIssuanceTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokenIssuanceTabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenIssuanceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
