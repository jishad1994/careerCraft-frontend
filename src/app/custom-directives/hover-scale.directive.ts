import { Directive, HostListener, ElementRef, Input, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appHoverScale]',
  standalone: true,
})
export class HoverScaleDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input() scale = 1.05;
  @Input() transition = '200ms';

  constructor() {
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
