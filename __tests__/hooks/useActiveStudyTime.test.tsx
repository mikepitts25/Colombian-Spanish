import { act, renderHook } from '@testing-library/react-native';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useActiveStudyTime } from '../../src/hooks/useActiveStudyTime';

let mockFocused = true;
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(
      () => (mockFocused ? callback() : undefined),
      [callback, mockFocused],
    );
  },
}));
let clock = 0;
let listener: (state: AppStateStatus) => void;
let blur: () => void;
let focus: () => void;
const descriptor = Object.getOwnPropertyDescriptor(AppState, 'currentState')!;
beforeEach(() => {
  mockFocused = true;
  clock = 0;
  Object.defineProperty(AppState, 'currentState', { configurable: true, value: 'active' });
  jest.spyOn(performance, 'now').mockImplementation(() => clock);
  jest.spyOn(AppState, 'addEventListener').mockImplementation((event, fn) => {
    if (event === 'change') listener = fn;
    if (event === 'blur') blur = fn as () => void;
    if (event === 'focus') focus = fn as () => void;
    return { remove: jest.fn() };
  });
});
afterEach(() => {
  jest.restoreAllMocks();
  Object.defineProperty(AppState, 'currentState', descriptor);
});
test('counts active focus, excludes OS/background/navigation/save waits and resets on card identity', () => {
  const hook = renderHook(({ id, enabled }) => useActiveStudyTime(id, enabled), {
    initialProps: { id: 'one', enabled: true },
  });
  clock = 3000;
  act(() => listener('inactive'));
  clock = 60000;
  act(() => listener('background'));
  act(() => listener('active'));
  clock = 62000;
  expect(hook.result.current()).toBe(5000);
  mockFocused = false;
  hook.rerender({ id: 'one', enabled: true });
  clock = 90000;
  expect(hook.result.current()).toBe(5000);
  mockFocused = true;
  hook.rerender({ id: 'one', enabled: true });
  clock = 91000;
  hook.rerender({ id: 'one', enabled: false });
  clock = 120000;
  expect(hook.result.current()).toBe(6000);
  hook.rerender({ id: 'two', enabled: true });
  clock = 122000;
  expect(hook.result.current()).toBe(2000);
});
test('does not time unknown OS state and discards unavailable identities', () => {
  Object.defineProperty(AppState, 'currentState', { configurable: true, value: null });
  const hook = renderHook(({ id }: { id?: string }) => useActiveStudyTime(id, true), {
    initialProps: { id: 'one' } as { id?: string },
  });
  clock = 30000;
  expect(hook.result.current()).toBeNull();
  act(() => listener('active'));
  clock = 32000;
  expect(hook.result.current()).toBe(2000);
  hook.rerender({ id: undefined });
  expect(hook.result.current()).toBeNull();
});

test('excludes Android interaction blur even when app state stays active, including effect restarts', () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const hook = renderHook(({ id }) => useActiveStudyTime(id, true), {
    initialProps: { id: 'one' },
  });
  clock = 2000;
  act(() => blur());
  clock = 30000;
  expect(hook.result.current()).toBe(2000);
  hook.rerender({ id: 'two' });
  clock = 60000;
  expect(hook.result.current()).toBeNull();
  act(() => listener('active'));
  clock = 90000;
  expect(hook.result.current()).toBeNull();
  act(() => focus());
  clock = 92000;
  expect(hook.result.current()).toBe(2000);
});
test('does not subscribe to unsupported Android-only events on iOS', () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  (AppState.addEventListener as jest.Mock).mockImplementation((event) => {
    if (event !== 'change') throw new Error('Unsupported iOS appStateFocusChange');
    return { remove: jest.fn() };
  });
  expect(() => renderHook(() => useActiveStudyTime('one', true))).not.toThrow();
});
