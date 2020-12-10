import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempstatComponent } from './tempstat.component';

describe('TempstatComponent', () => {
  let component: TempstatComponent;
  let fixture: ComponentFixture<TempstatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TempstatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TempstatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
