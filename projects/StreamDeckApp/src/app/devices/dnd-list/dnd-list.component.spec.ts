import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DndListComponent } from './dnd-list.component';

describe('DndListComponent', () => {
  let component: DndListComponent;
  let fixture: ComponentFixture<DndListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DndListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DndListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
