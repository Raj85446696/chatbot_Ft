import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDasboard } from './admin-dasboard';

describe('AdminDasboard', () => {
  let component: AdminDasboard;
  let fixture: ComponentFixture<AdminDasboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDasboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDasboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
