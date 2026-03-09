// 1. AsyncStorage mock (official mock provided by the library)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// 2. expo-speech mock
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

// 3. react-native-reanimated mock
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// 4. react-native-gesture-handler mock
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    GestureHandlerRootView: View,
    GestureDetector: ({ children }) => children,
    Gesture: {
      Pan: () => {
        const gesture = {
          onUpdate: () => gesture,
          onEnd: () => gesture,
          minDistance: () => gesture,
          onBegin: () => gesture,
          onFinalize: () => gesture,
        };
        return gesture;
      },
      Simultaneous: (...args) => args[0],
      Race: (...args) => args[0],
    },
    PanGestureHandler: View,
    State: {},
    Directions: {},
    ScrollView: require('react-native').ScrollView,
    Switch: require('react-native').Switch,
    TextInput: require('react-native').TextInput,
    DrawerLayoutAndroid: require('react-native').DrawerLayoutAndroid,
    FlatList: require('react-native').FlatList,
  };
});

// 5. @react-navigation/native mocks
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
      reset: jest.fn(),
    }),
    useRoute: () => ({ params: {}, name: 'MockScreen', key: 'mock' }),
    useFocusEffect: (cb) => {
      const cleanup = cb();
      return cleanup;
    },
    NavigationContainer: ({ children }) => children,
  };
});

// 6. expo-clipboard mock
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
  getStringAsync: jest.fn().mockResolvedValue(''),
}));

// 7. Silence Alert in tests
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// 8. AccessibilityInfo mock (used in Flashcard component)
// jest-expo preset handles the main RN mocks; we just patch isReduceMotionEnabled
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.AccessibilityInfo.isReduceMotionEnabled = jest.fn().mockResolvedValue(false);
  return RN;
});
