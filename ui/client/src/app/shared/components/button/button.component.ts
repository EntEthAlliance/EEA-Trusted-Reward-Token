import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'eea-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() text;
  @Input() type = 'primary';
  @Input() icon = '';
  @Input() fixedSize;
  @Input() disabled;
}
