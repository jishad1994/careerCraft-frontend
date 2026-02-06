import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[noSpace]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: NoSpaceDirective,
      multi: true
    }
  ]
})
export class NoSpaceDirective implements Validator {
  validate(control: AbstractControl) {
    if (!control.value) return null;

    const hasSpace = control.value.includes(' ');
    return hasSpace ? { noSpace: true } : null;
  }
}
