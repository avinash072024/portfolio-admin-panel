import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

export type CapitalizeMode =
  | 'first'
  | 'space'
  | 'dot-space';

@Directive({
  selector: '[appCapitalize]'
})
export class CapitalizeDirective {
  @Input('appCapitalize')
  mode: CapitalizeMode = 'first';

  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;

    if (!input) return;

    const originalValue = input.value;
    const cursorPosition = input.selectionStart;

    let transformedValue = originalValue;

    switch (this.mode) {
      case 'first':
        transformedValue = this.capitalizeFirstLetter(originalValue);
        break;

      case 'space':
        transformedValue = this.capitalizeAfterSpace(originalValue);
        break;

      case 'dot-space':
        transformedValue = this.capitalizeAfterDotSpace(originalValue);
        break;
    }

    if (originalValue !== transformedValue) {
      input.value = transformedValue;

      // Update Reactive Form
      this.ngControl.control?.setValue(
        transformedValue,
        { emitEvent: true }
      );

      // Keep cursor position
      if (cursorPosition !== null) {
        setTimeout(() => {
          input.setSelectionRange(cursorPosition, cursorPosition);
        });
      }
    }
  }

  /**
   * 1. Capitalize only the first letter
   *
   * Example:
   * web development
   *
   * Output:
   * Web development
   */
  private capitalizeFirstLetter(value: string): string {
    if (!value) return value;

    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  /**
   * 2. Capitalize first letter and every letter after space
   *
   * Example:
   * web development company
   *
   * Output:
   * Web Development Company
   */
  private capitalizeAfterSpace(value: string): string {
    if (!value) return value;

    return value.replace(
      /(^|\s)([a-z])/g,
      (_, separator: string, letter: string) =>
        separator + letter.toUpperCase()
    );
  }

  /**
   * 3. Capitalize first letter and letter after ". "
   *
   * Example:
   * this is angular. this is bootstrap.
   *
   * Output:
   * This is angular. This is bootstrap.
   */
  private capitalizeAfterDotSpace(value: string): string {
    if (!value) return value;

    return value.replace(
      /(^|\. )([a-z])/g,
      (_, separator: string, letter: string) =>
        separator + letter.toUpperCase()
    );
  }

}
