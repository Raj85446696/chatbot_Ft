import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAdmin } from './list-admin';

describe('ListAdmin', () => {
  let component: ListAdmin;
  let fixture: ComponentFixture<ListAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
