import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TooltipDirective } from './tooltip.directive';

describe('TooltipDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TooltipDirective,
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) }
      ]
    });
  });

  it('should create an instance', () => {
    const directive = TestBed.inject(TooltipDirective);
    expect(directive).toBeTruthy();
  });
});
