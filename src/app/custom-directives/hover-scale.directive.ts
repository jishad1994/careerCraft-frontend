import {
  Directive,
  HostListener,
  ElementRef,
  Input,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appHoverScale]',
  standalone: true,
})
export class HoverScaleDirective {
  @Input() scale = 1.05;
  @Input() transition = '200ms';

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      `transform ${this.transition} ease`
    );
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `scale(${this.scale})`
    );
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
  }
}
