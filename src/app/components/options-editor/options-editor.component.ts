import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import type { WheelOption } from '../../types/wheel.types';

@Component({
  selector: 'app-options-editor',
  templateUrl: './options-editor.component.html',
  styleUrl: './options-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsEditorComponent {
  readonly options = input.required<readonly WheelOption[]>();
  readonly placeholder = input.required<string>();
  readonly addButtonLabel = input.required<string>();
  readonly colorLabel = input.required<string>();
  readonly deleteLabel = input.required<string>();
  readonly emptyLabel = input.required<string>();

  readonly addOption = output<string>();
  readonly updateLabel = output<{ readonly id: string; readonly label: string }>();
  readonly updateColor = output<{ readonly id: string; readonly color: string }>();
  readonly removeOption = output<string>();

  protected readonly draft = signal('');

  protected submit(): void {
    const value = this.draft().trim();
    if (!value) {
      return;
    }

    this.addOption.emit(value);
    this.draft.set('');
  }

  protected onDraftInput(value: string): void {
    this.draft.set(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    this.submit();
  }

  protected trackById(_: number, option: WheelOption): string {
    return option.id;
  }
}
