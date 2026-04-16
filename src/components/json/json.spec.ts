import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Json } from './json';

describe('Json', () => {
  let component: Json;
  let fixture: ComponentFixture<Json>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Json]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Json);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
