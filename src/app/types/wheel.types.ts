export type LanguageCode = 'ca' | 'es' | 'en';

export type SpinTriggerMode = 'wheel' | 'button' | 'both';

export type WheelOption = {
  readonly id: string;
  readonly label: string;
  readonly color: string;
};

export type WheelSettings = {
  readonly spinDurationSeconds: number;
  readonly spinTurns: number;
  readonly removeWinner: boolean;
  readonly spinTrigger: SpinTriggerMode;
};

export type StoredWheelState = {
  readonly language: LanguageCode;
  readonly settings: WheelSettings;
  readonly options: readonly WheelOption[];
  readonly lastInteractionAt: number;
};

export type UiTextSet = {
  readonly appName: string;
  readonly languageLabel: string;
  readonly wheelAriaLabel: string;
  readonly wheelEmpty: string;
  readonly wheelClickHint: string;
  readonly wheelButtonHint: string;
  readonly wheelBothHint: string;
  readonly spin: string;
  readonly spinning: string;
  readonly fullscreenEnter: string;
  readonly fullscreenExit: string;
  readonly resultTitle: string;
  readonly resultEmpty: string;
  readonly optionsTitle: string;
  readonly optionsHint: string;
  readonly newOptionLabel: string;
  readonly newOptionPlaceholder: string;
  readonly addOption: string;
  readonly shuffle: string;
  readonly reset: string;
  readonly clear: string;
  readonly emptyList: string;
  readonly colorLabel: string;
  readonly deleteLabel: string;
  readonly quickSettingsTitle: string;
  readonly durationLabel: string;
  readonly spinModeLabel: string;
  readonly spinModeWheel: string;
  readonly spinModeButton: string;
  readonly spinModeBoth: string;
  readonly advancedTitle: string;
  readonly removeWinner: string;
  readonly cleanupHint: string;
  readonly footerCredits: string;
  readonly footerProject: string;
  readonly statusIdle: string;
  readonly statusSpinning: string;
  readonly statusCleared: string;
  readonly statusReset: string;
  readonly statusShuffled: string;
  readonly statusExpired: string;
};
