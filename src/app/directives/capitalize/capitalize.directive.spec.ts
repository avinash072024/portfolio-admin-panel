import { TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { CapitalizeDirective } from './capitalize.directive';

describe('CapitalizeDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CapitalizeDirective,
        { provide: NgControl, useValue: { control: null } }
      ]
    });
  });

  it('should create an instance', () => {
    const directive = TestBed.inject(CapitalizeDirective);
    expect(directive).toBeTruthy();
  });
});
