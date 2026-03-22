export type LanguageCode = 'ca' | 'es' | 'en';

export type WheelOption = {
  readonly id: string;
  readonly label: string;
  readonly color: string;
};

export type WheelSettings = {
  readonly spinDurationSeconds: number;
  readonly spinTurns: number;
  readonly removeWinner: boolean;
};

export type StoredWheelState = {
  readonly language: LanguageCode;
  readonly settings: WheelSettings;
  readonly options: readonly WheelOption[];
  readonly lastInteractionAt: number;
};

export type UiTextSet = {
  readonly appName: string;
  readonly appTagline: string;
  readonly languageLabel: string;
  readonly wheelAriaLabel: string;
  readonly wheelEmpty: string;
  readonly wheelHint: string;
  readonly spin: string;
  readonly spinning: string;
  readonly fullscreenEnter: string;
  readonly fullscreenExit: string;
  readonly resultIdle: string;
  readonly resultEmpty: string;
  readonly optionsTitle: string;
  readonly optionsHint: string;
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
