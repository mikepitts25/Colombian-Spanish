import { act, renderHook } from '@testing-library/react-native';
import { AccessibilityInfo, AppState } from 'react-native';
import { cafeTimeAt, useCafeAtmosphere } from '../../src/hooks/useCafeAtmosphere';
let mockFocused = true;
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(
      () => (mockFocused ? callback() : undefined),
      [callback, mockFocused],
    );
  },
}));
let foreground: (state: string) => void;
let reduceMotion: (value: boolean) => void;
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 10, 3, 11, 59, 30));
  mockFocused = true;
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    foreground = listener as typeof foreground;
    return { remove: jest.fn() };
  });
  (jest.spyOn(AccessibilityInfo, 'addEventListener') as jest.Mock).mockImplementation(
    (_: string, listener: (value: boolean) => void) => {
      reduceMotion = listener as typeof reduceMotion;
      return { remove: jest.fn() };
    },
  );
  (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test.each([
  [0, 'evening'],
  [5, 'evening'],
  [6, 'morning'],
  [11, 'morning'],
  [12, 'afternoon'],
  [18, 'afternoon'],
  [19, 'evening'],
  [23, 'evening'],
])('local hour %s has %s lighting', (hour, expected) => {
  expect(cafeTimeAt(new Date(2026, 10, 3, Number(hour)))).toBe(expected);
});
test('updates the atmosphere at a minute refresh and immediately on foreground', async () => {
  const { result } = renderHook(() => useCafeAtmosphere());
  expect(result.current.time).toBe('morning');
  await act(async () => jest.advanceTimersByTime(30000));
  expect(result.current.time).toBe('afternoon');
  act(() => foreground('background'));
  expect(result.current.animate).toBe(false);
  jest.setSystemTime(new Date(2026, 10, 3, 20));
  act(() => foreground('active'));
  expect(result.current.time).toBe('evening');
  expect(result.current.animate).toBe(true);
});
test('live Reduce Motion and losing Home focus stop decoration', async () => {
  const { result, rerender } = renderHook(() => useCafeAtmosphere());
  expect(result.current.animate).toBe(false);
  await act(async () => {});
  expect(result.current.animate).toBe(true);
  act(() => reduceMotion(true));
  expect(result.current.animate).toBe(false);
  act(() => reduceMotion(false));
  expect(result.current.animate).toBe(true);
  mockFocused = false;
  rerender({});
  expect(result.current.animate).toBe(false);
  mockFocused = true;
  rerender({});
  expect(result.current.animate).toBe(true);
});
test('a live motion preference wins over a delayed initial query', async () => {
  let resolve!: (value: boolean) => void;
  (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockReturnValueOnce(
    new Promise<boolean>((done) => {
      resolve = done;
    }),
  );
  const { result } = renderHook(() => useCafeAtmosphere());
  act(() => reduceMotion(true));
  await act(async () => resolve(false));
  expect(result.current.animate).toBe(false);
});
