import { AfterViewInit, Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

declare const bootstrap: any;

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input('appTooltip') tooltipText!: any;

  @Input() tooltipPlacement:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'auto' = 'top';

  private tooltipInstance: any;

  constructor(
    private elementRef: ElementRef<HTMLElement>
  ) { }

  ngAfterViewInit(): void {
    this.initializeTooltip();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['tooltipText'] &&
      !changes['tooltipText'].firstChange
    ) {
      this.updateTooltip();
    }
  }

  private initializeTooltip(): void {
    if (!this.tooltipText) {
      return;
    }

    this.tooltipInstance = new bootstrap.Tooltip(
      this.elementRef.nativeElement,
      {
        title: this.tooltipText,
        placement: this.tooltipPlacement,
        trigger: 'hover focus',
        container: 'body'
      }
    );
  }

  private updateTooltip(): void {
    if (!this.tooltipInstance) {
      this.initializeTooltip();
      return;
    }

    this.tooltipInstance.setContent({
      '.tooltip-inner': this.tooltipText
    });
  }

  ngOnDestroy(): void {
    this.tooltipInstance?.dispose();
  }
}
