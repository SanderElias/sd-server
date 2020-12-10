import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SdButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: SdButtonComponent;
  let fixture: ComponentFixture<SdButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SdButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SdButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
