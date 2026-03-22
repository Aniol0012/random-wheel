import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import type { WheelOption } from '../../types/wheel.types';

type WheelSlice = {
  readonly id: string;
  readonly label: string;
  readonly color: string;
  readonly path: string;
  readonly labelX: number;
  readonly labelY: number;
  readonly labelRotation: number;
};

type ConfettiPiece = {
  readonly id: string;
  readonly color: string;
  readonly left: string;
  readonly size: string;
  readonly delay: string;
  readonly duration: string;
  readonly drift: string;
  readonly rotation: string;
};

@Component({
  selector: 'app-wheel-stage',
  templateUrl: './wheel-stage.component.html',
  styleUrl: './wheel-stage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WheelStageComponent {
  readonly options = input.required<readonly WheelOption[]>();
  readonly rotation = input(0);
  readonly durationSeconds = input(4);
  readonly canSpin = input(false);
  readonly isSpinning = input(false);
  readonly spinLabel = input.required<string>();
  readonly spinningLabel = input.required<string>();
  readonly emptyLabel = input.required<string>();
  readonly wheelAriaLabel = input.required<string>();
  readonly resultText = input.required<string>();
  readonly statusText = input.required<string>();
  readonly isFullscreen = input(false);
  readonly fullscreenLabel = input.required<string>();
  readonly confettiPieces = input<readonly ConfettiPiece[]>([]);

  readonly spinRequested = output<void>();
  readonly fullscreenRequested = output<void>();

  protected readonly slices = computed<readonly WheelSlice[]>(() => {
    const options = this.options();
    if (options.length === 0) {
      return [];
    }

    const angle = 360 / options.length;
    return options.map((option, index) => {
      const startAngle = -90 + index * angle;
      const endAngle = startAngle + angle;
      const centerAngle = startAngle + angle / 2;
      const labelRadius = 68;
      const labelX = 100 + Math.cos(this.toRadians(centerAngle)) * labelRadius;
      const labelY = 100 + Math.sin(this.toRadians(centerAngle)) * labelRadius;

      return {
        id: option.id,
        label: option.label,
        color: option.color,
        path: this.createSlicePath(startAngle, endAngle),
        labelX,
        labelY,
        labelRotation: centerAngle + 90
      };
    });
  });

  protected requestSpin(): void {
    if (!this.canSpin()) {
      return;
    }

    this.spinRequested.emit();
  }

  protected onWheelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.requestSpin();
  }

  protected requestFullscreen(event: Event): void {
    event.stopPropagation();
    this.fullscreenRequested.emit();
  }

  private createSlicePath(startAngle: number, endAngle: number): string {
    const start = this.polarToCartesian(100, 100, 95, startAngle);
    const end = this.polarToCartesian(100, 100, 95, endAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return ['M 100 100', `L ${start.x} ${start.y}`, `A 95 95 0 ${largeArcFlag} 1 ${end.x} ${end.y}`, 'Z'].join(' ');
  }

  private polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ): { readonly x: number; readonly y: number } {
    const angleInRadians = this.toRadians(angleInDegrees);

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  private toRadians(angleInDegrees: number): number {
    return (angleInDegrees * Math.PI) / 180;
  }
}
