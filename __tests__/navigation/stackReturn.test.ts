import { StackRouter, CommonActions } from '@react-navigation/routers';
test('returning from a tool to an existing Root targets Study without duplicating its stack', () => {
  const router = StackRouter({ initialRouteName: 'Root' });
  const options = {
    routeNames: ['Root', 'Quiz'],
    routeParamList: { Root: undefined, Quiz: undefined },
    routeGetIdList: {},
  };
  const initial = router.getInitialState(options);
  const quiz = router.getRehydratedState(
    router.getStateForAction(initial, CommonActions.navigate('Quiz'), options)!,
    options,
  );
  expect(quiz.routes.map((r) => r.name)).toEqual(['Root', 'Quiz']);
  const returned = router.getStateForAction(
    quiz,
    CommonActions.navigate('Root', { screen: 'Study' }, { pop: true }),
    options,
  )!;
  expect(returned.routes.map((r) => r.name)).toEqual(['Root']);
  expect(returned.routes[0].key).toBe(initial.routes[0].key);
  expect(returned.routes[0].params).toMatchObject({ screen: 'Study' });
});
