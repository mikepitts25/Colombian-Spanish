import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
  createNavigatorFactory,
  StackRouter,
  useNavigationBuilder,
} from '@react-navigation/native';
import ReviewScreen from '../../src/screens/ReviewScreen';
import { useDeck } from '../../src/hooks/useDeck';

jest.unmock('@react-navigation/native');
jest.mock('../../src/hooks/useDeck', () => ({ useDeck: jest.fn() }));

// Use the real navigation state machine and remove-prevention context without
// replacing native view transitions with a mock of the guard itself.
function TestNavigator(props: any) {
  const { state, descriptors, NavigationContent } = useNavigationBuilder(StackRouter, props);
  return (
    <NavigationContent>{descriptors[state.routes[state.index].key].render()}</NavigationContent>
  );
}
const Stack = createNavigatorFactory(TestNavigator)();
const Home = () => <Text>QA home</Text>;

test('real router blocks Back during a save and failed retry, then permits it after success', async () => {
  let rejectSave!: (error: Error) => void;
  let finishRetry!: () => void;
  const updateCardReview = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          rejectSave = reject;
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishRetry = resolve;
        }),
    );
  (useDeck as jest.Mock).mockReturnValue({
    ready: true,
    decks: [
      {
        id: 'qa',
        name: 'QA',
        cards: [
          {
            id: 'one',
            front: 'hola',
            back: 'hello',
            createdAt: 0,
            due: 0,
            reps: 0,
            interval: 0,
            ease: 2.5,
          },
        ],
      },
    ],
    updateCardReview,
  });
  const navigation = createNavigationContainerRef<any>();
  const screen = render(
    <NavigationContainer ref={navigation}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Review" component={ReviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
  );
  await waitFor(() => expect(navigation.isReady()).toBe(true));
  await act(async () => navigation.navigate('Review'));
  fireEvent.press(await screen.findByText('Guardar y seguir'));
  await act(async () => navigation.goBack());
  expect(navigation.getCurrentRoute()?.name).toBe('Review');
  await act(async () => rejectSave(new Error('QA write failure')));
  await screen.findByText('No se pudieron guardar los cambios. Reintenta antes de continuar.');
  await act(async () => navigation.goBack());
  expect(navigation.getCurrentRoute()?.name).toBe('Review');
  fireEvent.press(screen.getByText('Intentar guardar de nuevo'));
  await act(async () => finishRetry());
  await act(async () => navigation.goBack());
  expect(navigation.getCurrentRoute()?.name).toBe('Home');
  expect(screen.getByText('QA home')).toBeTruthy();
});
