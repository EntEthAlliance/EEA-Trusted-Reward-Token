import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareTabComponent } from './share-tab.component';

describe('ShareComponent', () => {
  let component: ShareTabComponent;
  let fixture: ComponentFixture<ShareTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareTabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
