import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenCounterFormComponent } from './token-counter-form.component';

describe('TokenCounterFormComponent', () => {
  let component: TokenCounterFormComponent;
  let fixture: ComponentFixture<TokenCounterFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenCounterFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenCounterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
