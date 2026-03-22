import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge } from 'rxjs';

import { OptionsEditorComponent } from './components/options-editor/options-editor.component';
import { WheelStageComponent } from './components/wheel-stage/wheel-stage.component';
import { APP_TEXTS } from './i18n/app-texts';
import type {
  LanguageCode,
  StoredWheelState,
  WheelOption,
  WheelSettings,
} from './types/wheel.types';

type AnnouncementState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'spinning' }
  | { readonly kind: 'winner'; readonly label: string }
  | { readonly kind: 'added'; readonly count: number }
  | { readonly kind: 'cleared' }
  | { readonly kind: 'reset' }
  | { readonly kind: 'shuffled' }
  | { readonly kind: 'expired' };

const STORAGE_KEY = 'random-wheel-state-v2';
const INACTIVITY_LIMIT_MS = 20 * 60 * 1000;
const DEFAULT_LANGUAGE: LanguageCode = 'ca';
const DEFAULT_SETTINGS: WheelSettings = {
  spinDurationSeconds: 4,
  spinTurns: 6,
  removeWinner: false,
};
const DEFAULT_OPTION_COLORS = [
  '#34c759',
  '#30b0c7',
  '#ff9f0a',
  '#ff375f',
  '#5856d6',
  '#64d2ff',
  '#ffd60a',
  '#8e8e93',
];

@Component({
  selector: 'app-root',
  imports: [WheelStageComponent, OptionsEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly initialState = this.loadState();
  private spinTimeoutId: ReturnType<typeof setTimeout> | null = null;

  protected readonly language = signal<LanguageCode>(this.initialState.language);
  protected readonly settings = signal<WheelSettings>(this.initialState.settings);
  protected readonly options = signal<readonly WheelOption[]>(this.initialState.options);
  protected readonly rotation = signal(0);
  protected readonly selectedOptionId = signal<string | null>(null);
  protected readonly announcement = signal<AnnouncementState>({ kind: 'idle' });
  protected readonly isSpinning = signal(false);
  protected readonly isFullscreen = signal(false);
  private readonly lastInteractionAt = signal(this.initialState.lastInteractionAt);

  protected readonly texts = computed(() => APP_TEXTS[this.language()]);
  protected readonly selectedOption = computed(() => {
    const selectedId = this.selectedOptionId();
    return this.options().find((option) => option.id === selectedId) ?? null;
  });
  protected readonly canSpin = computed(
    () => this.options().length > 1 && !this.isSpinning()
  );
  protected readonly hintText = computed(() => this.texts().wheelHint);
  protected readonly statusMessage = computed(() => {
    const texts = this.texts();
    const announcement = this.announcement();

    switch (announcement.kind) {
      case 'spinning':
        return texts.statusSpinning;
      case 'winner':
        return texts.statusIdle;
      case 'added':
        return this.formatAddedMessage(announcement.count);
      case 'cleared':
        return texts.statusCleared;
      case 'reset':
        return texts.statusReset;
      case 'shuffled':
        return texts.statusShuffled;
      case 'expired':
        return texts.statusExpired;
      default:
        return texts.statusIdle;
    }
  });
  protected readonly optionCountLabel = computed(() =>
    this.formatOptionCount(this.options().length)
  );
  protected readonly resultLabel = computed(() => {
    const selectedOption = this.selectedOption();
    if (selectedOption) {
      return selectedOption.label;
    }

    if (this.isSpinning()) {
      return this.texts().spinning;
    }

    return this.options().length > 1
      ? this.texts().resultIdle
      : this.texts().resultEmpty;
  });

  constructor() {
    effect(() => {
      if (!this.isBrowser) {
        return;
      }

      const state: StoredWheelState = {
        language: this.language(),
        settings: this.settings(),
        options: this.options(),
        lastInteractionAt: this.lastInteractionAt(),
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    });

    if (!this.isBrowser) {
      return;
    }

    merge(
      fromEvent(document, 'pointerdown'),
      fromEvent(document, 'keydown'),
      fromEvent(window, 'focus'),
      fromEvent(document, 'visibilitychange'),
      fromEvent(document, 'fullscreenchange')
    )
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event.type === 'fullscreenchange') {
          this.isFullscreen.set(Boolean(document.fullscreenElement));
          return;
        }

        this.registerInteraction();
      });
  }

  protected setLanguage(language: string): void {
    if (language === this.language()) {
      return;
    }
    this.language.set(language as LanguageCode);
    this.registerInteraction();
  }

  protected addOption(label: string): void {
    this.options.update((currentOptions) => [
      ...currentOptions,
      this.createOption(label, currentOptions.length),
    ]);
    this.announcement.set({ kind: 'added', count: 1 });
    this.registerInteraction();
  }

  protected updateOptionLabel(payload: {
    readonly id: string;
    readonly label: string;
  }): void {
    this.options.update((currentOptions) =>
      currentOptions.map((option) =>
        option.id === payload.id
          ? { ...option, label: payload.label.trim() || option.label }
          : option
      )
    );
    this.registerInteraction();
  }

  protected updateOptionColor(payload: {
    readonly id: string;
    readonly color: string;
  }): void {
    this.options.update((currentOptions) =>
      currentOptions.map((option) =>
        option.id === payload.id ? { ...option, color: payload.color } : option
      )
    );
    this.registerInteraction();
  }

  protected removeOption(optionId: string): void {
    this.options.update((currentOptions) =>
      currentOptions.filter((option) => option.id !== optionId)
    );

    if (this.selectedOptionId() === optionId) {
      this.selectedOptionId.set(null);
    }

    this.registerInteraction();
  }

  protected shuffleOptions(): void {
    const shuffled = [...this.options()];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [
        shuffled[swapIndex],
        shuffled[index],
      ];
    }

    this.options.set(shuffled);
    this.announcement.set({ kind: 'shuffled' });
    this.registerInteraction();
  }

  protected clearOptions(): void {
    this.options.set([]);
    this.selectedOptionId.set(null);
    this.announcement.set({ kind: 'cleared' });
    this.registerInteraction();
  }

  protected resetWorkspace(): void {
    this.options.set([]);
    this.settings.set(DEFAULT_SETTINGS);
    this.rotation.set(0);
    this.selectedOptionId.set(null);
    this.announcement.set({ kind: 'reset' });
    this.registerInteraction();
  }

  protected updateDuration(value: string): void {
    const duration = Number(value);
    this.settings.update((currentSettings) => ({
      ...currentSettings,
      spinDurationSeconds: this.clamp(duration, 1, 10),
    }));
    this.registerInteraction();
  }

  protected setRemoveWinner(removeWinner: boolean): void {
    this.settings.update((currentSettings) => ({
      ...currentSettings,
      removeWinner,
    }));
    this.registerInteraction();
  }

  protected spinWheel(): void {
    const options = this.options();
    if (options.length < 2 || this.isSpinning()) {
      return;
    }

    this.registerInteraction();

    const winnerIndex = Math.floor(Math.random() * options.length);
    const anglePerSlice = 360 / options.length;
    const targetRotation = this.calculateTargetRotation(winnerIndex, anglePerSlice);
    const duration = this.resolveSpinDuration();

    this.isSpinning.set(true);
    this.selectedOptionId.set(null);
    this.announcement.set({ kind: 'spinning' });
    this.rotation.set(targetRotation);

    if (this.spinTimeoutId !== null) {
      clearTimeout(this.spinTimeoutId);
    }

    this.spinTimeoutId = setTimeout(() => {
      const winner = this.options()[winnerIndex] ?? null;
      this.isSpinning.set(false);

      if (!winner) {
        return;
      }

      this.selectedOptionId.set(winner.id);
      this.announcement.set({ kind: 'winner', label: winner.label });

      if (this.settings().removeWinner && this.options().length > 1) {
        this.options.update((currentOptions) =>
          currentOptions.filter((option) => option.id !== winner.id)
        );
        this.selectedOptionId.set(null);
      }
    }, duration);
  }

  protected async toggleFullscreen(): Promise<void> {
    if (!this.isBrowser || !document.documentElement.requestFullscreen) {
      return;
    }

    this.registerInteraction();

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  }

  protected trackLanguage(_: number, language: string): LanguageCode {
    return language as LanguageCode;
  }

  private registerInteraction(): void {
    const now = Date.now();
    this.expireOptionsIfNeeded(now);
    this.lastInteractionAt.set(now);
  }

  private expireOptionsIfNeeded(referenceTime: number): void {
    if (referenceTime - this.lastInteractionAt() <= INACTIVITY_LIMIT_MS) {
      return;
    }

    if (this.options().length === 0) {
      return;
    }

    this.options.set([]);
    this.selectedOptionId.set(null);
    this.announcement.set({ kind: 'expired' });
  }

  private calculateTargetRotation(
    winnerIndex: number,
    anglePerSlice: number
  ): number {
    const currentRotation = this.rotation();
    const normalizedRotation = ((currentRotation % 360) + 360) % 360;
    const targetNormalized =
      (270 - (winnerIndex * anglePerSlice + anglePerSlice / 2) + 360) % 360;
    const delta = (targetNormalized - normalizedRotation + 360) % 360;

    return currentRotation + this.settings().spinTurns * 360 + delta;
  }

  private resolveSpinDuration(): number {
    if (!this.isBrowser) {
      return 0;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 200
      : this.settings().spinDurationSeconds * 1000;
  }

  private loadState(): StoredWheelState {
    const fallbackState: StoredWheelState = {
      language: DEFAULT_LANGUAGE,
      settings: DEFAULT_SETTINGS,
      options: [],
      lastInteractionAt: Date.now(),
    };

    if (!this.isBrowser) {
      return fallbackState;
    }

    try {
      const rawState = window.localStorage.getItem(STORAGE_KEY);
      if (!rawState) {
        return fallbackState;
      }

      const parsed = JSON.parse(rawState) as Partial<StoredWheelState>;
      const options = Array.isArray(parsed.options)
        ? parsed.options.filter(
            (option): option is WheelOption =>
              typeof option?.id === 'string' &&
              typeof option?.label === 'string' &&
              typeof option?.color === 'string'
          )
        : [];
      const lastInteractionAt =
        typeof parsed.lastInteractionAt === 'number'
          ? parsed.lastInteractionAt
          : Date.now();

      return {
        language: this.parseLanguage(parsed.language),
        settings: this.parseSettings(parsed.settings),
        options:
          Date.now() - lastInteractionAt > INACTIVITY_LIMIT_MS ? [] : options,
        lastInteractionAt,
      };
    } catch {
      return fallbackState;
    }
  }

  private parseLanguage(language: unknown): LanguageCode {
    return language === 'es' || language === 'en' ? language : DEFAULT_LANGUAGE;
  }

  private parseSettings(settings: unknown): WheelSettings {
    if (!settings || typeof settings !== 'object') {
      return DEFAULT_SETTINGS;
    }

    const candidate = settings as Partial<WheelSettings>;

    return {
      spinDurationSeconds:
        typeof candidate.spinDurationSeconds === 'number'
          ? this.clamp(candidate.spinDurationSeconds, 1, 10)
          : DEFAULT_SETTINGS.spinDurationSeconds,
      spinTurns:
        typeof candidate.spinTurns === 'number'
          ? this.clamp(candidate.spinTurns, 3, 9)
          : DEFAULT_SETTINGS.spinTurns,
      removeWinner:
        typeof candidate.removeWinner === 'boolean'
          ? candidate.removeWinner
          : DEFAULT_SETTINGS.removeWinner,
    };
  }

  private formatOptionCount(count: number): string {
    if (this.language() === 'en') {
      return `${count} ${count === 1 ? 'option' : 'options'}`;
    }

    if (this.language() === 'es') {
      return `${count} ${count === 1 ? 'opción' : 'opciones'}`;
    }

    return `${count} ${count === 1 ? 'opció' : 'opcions'}`;
  }

  private formatAddedMessage(count: number): string {
    if (this.language() === 'en') {
      return `${count} ${count === 1 ? 'option added.' : 'options added.'}`;
    }

    if (this.language() === 'es') {
      return `${count} ${count === 1 ? 'opción añadida.' : 'opciones añadidas.'}`;
    }

    return `${count} ${count === 1 ? 'opció afegida.' : 'opcions afegides.'}`;
  }

  private createOption(label: string, index: number): WheelOption {
    return {
      id: this.createOptionId(),
      label,
      color: DEFAULT_OPTION_COLORS[index % DEFAULT_OPTION_COLORS.length],
    };
  }

  private createOptionId(): string {
    if (this.isBrowser && 'crypto' in window && 'randomUUID' in window.crypto) {
      return window.crypto.randomUUID();
    }

    return `option-${Math.random().toString(36).slice(2, 10)}`;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
