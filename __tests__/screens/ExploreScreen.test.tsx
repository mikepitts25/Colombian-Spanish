import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ExploreScreen from '../../src/screens/ExploreScreen';
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

test('Browse decks explicitly opens topics instead of returning to a retained study session', () => {
  const ui = render(<ExploreScreen />);
  fireEvent.press(ui.getByText('📚 Ver todos los decks'));
  expect(mockNavigate).toHaveBeenCalledWith(
    'Root',
    {
      screen: 'Study',
      params: { topicBrowserRequest: expect.any(String) },
    },
    { pop: true },
  );
});
