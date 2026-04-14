import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Experiencias } from './experiencias';

describe('Experiencias', () => {
  let component: Experiencias;
  let fixture: ComponentFixture<Experiencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Experiencias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Experiencias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
