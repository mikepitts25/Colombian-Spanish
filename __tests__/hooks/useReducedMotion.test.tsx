import React from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';
import { useReducedMotion } from '../../src/hooks/useReducedMotion';
function Probe() {
  return <Text>{useReducedMotion() ? 'reduced' : 'animated'}</Text>;
}
afterEach(() => jest.restoreAllMocks());
test('defaults to reduced motion, applies preference, handles live changes and removes listener', async () => {
  let release!: (value: boolean) => void;
  let changed!: (value: boolean) => void;
  const remove = jest.fn();
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(
    new Promise((r) => {
      release = r;
    }),
  );
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((_name, cb: any) => {
    changed = cb;
    return { remove } as any;
  });
  const ui = render(<Probe />);
  expect(ui.getByText('reduced')).toBeTruthy();
  await act(async () => release(false));
  expect(ui.getByText('animated')).toBeTruthy();
  act(() => changed(true));
  expect(ui.getByText('reduced')).toBeTruthy();
  ui.unmount();
  expect(remove).toHaveBeenCalledTimes(1);
});
test('late initial query cannot overwrite a newer system change', async () => {
  let release!: (value: boolean) => void;
  let changed!: (value: boolean) => void;
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(
    new Promise((r) => {
      release = r;
    }),
  );
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((_name, cb: any) => {
    changed = cb;
    return { remove: jest.fn() } as any;
  });
  const ui = render(<Probe />);
  act(() => changed(true));
  await act(async () => release(false));
  expect(ui.getByText('reduced')).toBeTruthy();
});
test('query failure stays reduced and listener still works', async () => {
  let changed!: (value: boolean) => void;
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockRejectedValue(new Error('unavailable'));
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((_name, cb: any) => {
    changed = cb;
    return { remove: jest.fn() } as any;
  });
  const ui = render(<Probe />);
  await waitFor(() => expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled());
  expect(ui.getByText('reduced')).toBeTruthy();
  act(() => changed(false));
  expect(ui.getByText('animated')).toBeTruthy();
});
