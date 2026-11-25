import { fireEvent, screen, waitFor } from '@testing-library/react-native';

/** Use the learner's reveal action before a test grades the current Study card. */
export async function revealStudyCard(ui: Pick<typeof screen, 'queryByTestId' | 'findByTestId'>) {
  if (ui.queryByTestId('study-grades')) return;
  fireEvent.press(await ui.findByTestId('study-reveal'));
  await waitFor(() => expect(ui.queryByTestId('study-grades')).toBeTruthy());
}
