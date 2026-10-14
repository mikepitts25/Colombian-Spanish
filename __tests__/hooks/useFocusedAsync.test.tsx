import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';
import { useFocusedAsync } from '../../src/hooks/useFocusedAsync';

let mockFocusVersion = 0;
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => {
    const React = require('react');
    React.useEffect(callback, [callback, mockFocusVersion]);
  },
}));
let onStateChange: (state: AppStateStatus) => void;
beforeEach(() => {
  mockFocusVersion = 0;
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    onStateChange = listener;
    return { remove: jest.fn() };
  });
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('refreshes on focus and foreground and discards an older in-flight result', async () => {
  let resolveOld: (value: number) => void = () => {};
  const load = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<number>((resolve) => {
          resolveOld = resolve;
        }),
    )
    .mockResolvedValueOnce(2)
    .mockResolvedValueOnce(3);
  const hook = renderHook(() => useFocusedAsync(load, 0));
  await act(async () => {
    onStateChange('active');
  });
  expect(hook.result.current.value).toBe(2);
  await act(async () => {
    resolveOld(1);
  });
  expect(hook.result.current.value).toBe(2);
  mockFocusVersion++;
  hook.rerender({});
  await waitFor(() => expect(hook.result.current.value).toBe(3));
});
test('refreshes across local midnight while the screen remains focused', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 9, 14, 23, 59, 30));
  const load = jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);
  const hook = renderHook(() => useFocusedAsync(load, 0));
  await act(async () => {});
  expect(hook.result.current.value).toBe(1);
  await act(async () => {
    jest.advanceTimersByTime(60000);
  });
  expect(hook.result.current.value).toBe(2);
  expect(load).toHaveBeenCalledTimes(2);
});
test('retains the last good value on error and can recover on foreground', async () => {
  const load = jest
    .fn()
    .mockResolvedValueOnce(1)
    .mockRejectedValueOnce(new Error('disk'))
    .mockResolvedValueOnce(3);
  const hook = renderHook(() => useFocusedAsync(load, 0));
  await waitFor(() => expect(hook.result.current.value).toBe(1));
  await act(async () => {
    onStateChange('active');
  });
  expect(hook.result.current.error).toBe(true);
  expect(hook.result.current.value).toBe(1);
  await act(async () => {
    onStateChange('active');
  });
  expect(hook.result.current.error).toBe(false);
  expect(hook.result.current.value).toBe(3);
});
test('cleans up listeners/timers and ignores a result after unmount', async () => {
  let resolve: (value: number) => void = () => {};
  const load = jest.fn(
    () =>
      new Promise<number>((done) => {
        resolve = done;
      }),
  );
  const hook = renderHook(() => useFocusedAsync(load, 0));
  const subscription = (AppState.addEventListener as jest.Mock).mock.results[0].value;
  hook.unmount();
  await act(async () => {
    resolve(9);
  });
  expect(subscription.remove).toHaveBeenCalledTimes(1);
  expect(hook.result.current.value).toBe(0);
});
