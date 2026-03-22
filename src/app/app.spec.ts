import { TestBed } from '@angular/core/testing';
import { App } from './app';

const STORAGE_KEY = 'random-wheel-state-v2';

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
    spyOnProperty(window.navigator, 'languages', 'get').and.returnValue(['es-ES']);
    spyOnProperty(window.navigator, 'language', 'get').and.returnValue('es-ES');

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const activeLanguage = compiled.querySelector('.language-button.is-active')?.textContent?.trim();
    expect(activeLanguage).toBe('ES');
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
    spyOnProperty(window.navigator, 'languages', 'get').and.returnValue(['es-ES']);
    spyOnProperty(window.navigator, 'language', 'get').and.returnValue('es-ES');

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const activeLanguage = compiled.querySelector('.language-button.is-active')?.textContent?.trim();
    expect(activeLanguage).toBe('EN');
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
