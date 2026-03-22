import { TestBed } from '@angular/core/testing';
import { App } from './app';

const STORAGE_KEY = 'random-wheel-state-v2';

const mockNavigatorLanguage = (language: string, languages: readonly string[]): (() => void) => {
  const languageDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, 'language');
  const languagesDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, 'languages');

  Object.defineProperty(globalThis.navigator, 'language', {
    configurable: true,
    get: () => language
  });
  Object.defineProperty(globalThis.navigator, 'languages', {
    configurable: true,
    get: () => languages
  });

  return () => {
    if (languageDescriptor) {
      Object.defineProperty(globalThis.navigator, 'language', languageDescriptor);
    }
    if (languagesDescriptor) {
      Object.defineProperty(globalThis.navigator, 'languages', languagesDescriptor);
    }
  };
};

const mockMatchMedia = (matches: boolean): (() => void) => {
  const previousMatchMedia = window.matchMedia;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false
      }) as MediaQueryList
  });

  return () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: previousMatchMedia
    });
  };
};

describe('App', () => {
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the default wheel title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Random Wheel');
  });

  it('should start with no removable options', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.delete-button').length).toBe(0);
  });

  it('should use browser language when there is no stored state', async () => {
    const restoreNavigator = mockNavigatorLanguage('es-ES', ['es-ES']);

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const activeLanguage = compiled.querySelector('.language-button.is-active')?.textContent?.trim();
    expect(activeLanguage).toBe('ES');

    restoreNavigator();
  });

  it('should prioritize stored language over browser language', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        language: 'en',
        settings: { spinDurationSeconds: 4, spinTurns: 6, removeWinner: false, showConfetti: true },
        options: [],
        lastInteractionAt: Date.now()
      })
    );
    const restoreNavigator = mockNavigatorLanguage('es-ES', ['es-ES']);

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const activeLanguage = compiled.querySelector('.language-button.is-active')?.textContent?.trim();
    expect(activeLanguage).toBe('EN');

    restoreNavigator();
  });

  it('should default to system dark mode when no theme is stored', async () => {
    const restoreNavigator = mockNavigatorLanguage('en-US', ['en-US']);
    const restoreMatchMedia = mockMatchMedia(true);

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-shell')?.classList.contains('theme-dark')).toBe(true);

    restoreMatchMedia();
    restoreNavigator();
  });

  it('should prioritize stored theme over system preference', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        language: 'en',
        theme: 'light',
        settings: { spinDurationSeconds: 4, spinTurns: 6, removeWinner: false, showConfetti: true },
        options: [],
        lastInteractionAt: Date.now()
      })
    );
    const restoreNavigator = mockNavigatorLanguage('en-US', ['en-US']);
    const restoreMatchMedia = mockMatchMedia(true);

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-shell')?.classList.contains('theme-light')).toBe(true);

    restoreMatchMedia();
    restoreNavigator();
  });

  it('should align the resolved winner with the top pointer after rotation', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as unknown as {
      calculateTargetRotation: (winnerIndex: number, anglePerSlice: number) => number;
      resolveWinnerIndexAtPointer: (optionCount: number, rotation: number) => number | null;
    };

    const optionCount = 8;
    const anglePerSlice = 360 / optionCount;

    for (let winnerIndex = 0; winnerIndex < optionCount; winnerIndex += 1) {
      const rotation = app.calculateTargetRotation(winnerIndex, anglePerSlice);
      const resolvedWinnerIndex = app.resolveWinnerIndexAtPointer(optionCount, rotation);
      expect(resolvedWinnerIndex).toBe(winnerIndex);
    }
  });
});
