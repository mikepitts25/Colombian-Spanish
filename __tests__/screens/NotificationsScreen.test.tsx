import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import NotificationsScreen from '../../src/screens/NotificationsScreen';
import {
  DEFAULT_NOTIFICATION_PREFS,
  getNotificationPreferences,
  saveAndScheduleNotificationPreferences,
} from '../../src/services/notifications';

jest.mock('../../src/services/notifications', () => ({
  DEFAULT_NOTIFICATION_PREFS: {
    masterOn: true,
    morningOn: true,
    nightOn: false,
    streakOn: true,
    achieveOn: true,
  },
  getNotificationPreferences: jest.fn(),
  saveAndScheduleNotificationPreferences: jest.fn().mockResolvedValue(undefined),
}));

const mockGetPrefs = getNotificationPreferences as jest.Mock;
const mockSavePrefs = saveAndScheduleNotificationPreferences as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPrefs.mockResolvedValue(DEFAULT_NOTIFICATION_PREFS);
});

describe('NotificationsScreen', () => {
  it('saves and schedules preferences when the master toggle changes', async () => {
    const { getByTestId } = render(<NotificationsScreen />);

    await waitFor(() => expect(mockGetPrefs).toHaveBeenCalled());
    fireEvent(getByTestId('notification-master-toggle'), 'valueChange', false);

    await waitFor(() =>
      expect(mockSavePrefs).toHaveBeenCalledWith({
        ...DEFAULT_NOTIFICATION_PREFS,
        masterOn: false,
      }),
    );
  });
});
