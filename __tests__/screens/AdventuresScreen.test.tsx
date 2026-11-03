import React from 'react';
import { fireEvent, waitFor, within } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderWithTheme } from '../../testFixtures/renderWithTheme';
import AdventureScreen from '../../src/screens/AdventureScreen';
import AdventuresScreen from '../../src/screens/AdventuresScreen';
import { ADVENTURES } from '../../src/adventures/content';
import { createAdventureAdapter, readAdventures } from '../../src/storage/adventures';
import { translations } from '../../src/i18n/translations';
const mockNavigate = jest.fn(),
  mockBack = jest.fn();
let mockPreview = true;
let mockCafeOverride: boolean | undefined;
let mockLanguage: 'en' | 'es' = 'en';
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockBack }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, [cb]),
}));
jest.mock('../../src/config', () => ({
  get SHOW_CAFE_DRAFTS() {
    return mockCafeOverride ?? mockPreview;
  },
  get SHOW_REVIEW_TOOLS() {
    return mockPreview;
  },
}));
jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: () => ({ ready: true, decks: require('../../src/data/decks').ALL_DECKS }),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: mockLanguage,
    t: (key: any, values?: any) =>
      require('../../src/i18n/translations').translate(mockLanguage, key, values),
  }),
}));
beforeEach(async () => {
  await AsyncStorage.clear();
  mockPreview = true;
  mockCafeOverride = undefined;
  mockLanguage = 'en';
  jest.clearAllMocks();
});
const scene = () =>
  renderWithTheme(
    <AdventureScreen route={{ params: { id: ADVENTURES[0].pack.id, mode: 'preview' } }} />,
  );
test.each(['classic', 'barrio'] as const)(
  'completed visit shows a durable preview stamp and next-visit action in %s',
  async (themeId) => {
    const ui = scene();
    ui.applyTheme({ themeId, appearanceMode: 'light' });
    fireEvent.press(await ui.findByText('Start visit'));
    fireEvent.press(await ui.findByText('Continue'));
    for (const answer of ['Buenos días', 'Un café, por favor']) {
      fireEvent.changeText(await ui.findByLabelText('Your response'), answer);
      fireEvent.press(ui.getByText('Check answer'));
      fireEvent.press(await ui.findByText('Continue'));
    }
    fireEvent.press(await ui.findByText('Accept water'));
    fireEvent.press(await ui.findByText('Continue'));
    fireEvent.changeText(await ui.findByLabelText('Your response'), 'gracias');
    fireEvent.press(ui.getByText('Check answer'));
    fireEvent.press(await ui.findByText('Continue'));
    expect(await ui.findByText('Preview stamp earned')).toBeTruthy();
    expect(await ui.findByText('Completed without recorded help')).toBeTruthy();
    fireEvent.press(ui.getByText('Next visit: Back at Ana’s café'));
    expect(mockNavigate).toHaveBeenCalledWith('Adventure', {
      id: 'back-at-anas-cafe',
      mode: 'preview',
    });
    expect((await readAdventures()).outcomes).toHaveLength(1);
  },
);
test('warm-up records support before revealing a phrase and resumes the same scene', async () => {
  const ui = scene();
  fireEvent.press(await ui.findByText('Start visit'));
  fireEvent.press(await ui.findByText('Warm up with three phrases'));
  expect(await ui.findByText('good morning')).toBeTruthy();
  const state = await readAdventures();
  expect(state.runs[0].warmupUsed).toBe(true);
  fireEvent.press(ui.getByText('Reveal phrase'));
  expect(await ui.findByText('buenos días')).toBeTruthy();
  fireEvent.press(ui.getByText('Return to mission'));
  expect(await ui.findByText('Ana’s café')).toBeTruthy();
});
test('release cannot open draft scenes or advertise unavailable adventures', async () => {
  mockPreview = false;
  const ui = scene();
  expect(await ui.findByText('This visit is not available. Return to your practice.')).toBeTruthy();
  expect(ui.queryByText('Start visit')).toBeNull();
  ui.unmount();
  const list = renderWithTheme(<AdventuresScreen />);
  expect(
    await list.findByText(
      'New visits will appear here when they are ready. Your usual practice is available from Home.',
    ),
  ).toBeTruthy();
});
test('episode two remains visibly locked until visit one has saved', async () => {
  const ui = renderWithTheme(<AdventuresScreen />);
  expect(
    await ui.findByText('Complete “Breakfast at Ana’s café” to continue the story.'),
  ).toBeTruthy();
  expect(ui.getByText('Complete “The bill, please” to continue the story.')).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
  await waitFor(() => expect(ui.getByText('Breakfast at Ana’s café')).toBeTruthy());
});
test('all adventure copy exists in both interface languages', () => {
  const keys = Object.keys(translations.en).filter((k) => k.startsWith('adventure.'));
  expect(keys.length).toBeGreaterThan(20);
  for (const key of keys) expect((translations.es as any)[key]).toBeTruthy();
});

test('changed content asks before replacing unfinished progress and Cancel keeps the run', async () => {
  const { default: MissionScreen } = require('../../src/screens/MissionScreen');
  const { startMission } = require('../../src/missions/engine');
  const run = startMission(ADVENTURES[0].pack, 'unfinished', 10);
  const adapter = {
    load: async () => ({ run, contentChanged: true }),
    start: jest.fn(async () => run),
    apply: jest.fn(),
  };
  const ui = renderWithTheme(
    <MissionScreen pack={ADVENTURES[0].pack} adapter={adapter} availability={true} />,
  );
  fireEvent.press(await ui.findByText('Start this version'));
  expect(adapter.start).not.toHaveBeenCalled();
  fireEvent.press(ui.getByText('Cancel'));
  expect(adapter.start).not.toHaveBeenCalled();
  fireEvent.press(ui.getByText('Start this version'));
  fireEvent.press(ui.getByText('Restart mission'));
  await waitFor(() => expect(adapter.start).toHaveBeenCalledTimes(1));
  expect(adapter.start).toHaveBeenCalledWith(expect.any(String), expect.any(Number), 'unfinished');
});
test('a failed pending start retains its original adapter across content refresh', async () => {
  const { default: MissionScreen } = require('../../src/screens/MissionScreen');
  const { ThemeProvider } = require('../../src/context/ThemeContext');
  const original = {
    load: async () => ({ contentChanged: false }),
    start: jest.fn().mockRejectedValue(new Error('old identity unavailable')),
    apply: jest.fn(),
  };
  const refreshed = { ...original, start: jest.fn() };
  const renderScene = (adapter: any) => (
    <ThemeProvider>
      <MissionScreen pack={ADVENTURES[0].pack} adapter={adapter} availability={true} />
    </ThemeProvider>
  );
  const { render } = require('@testing-library/react-native');
  const ui = render(renderScene(original));
  fireEvent.press(await ui.findByText('Start draft mission'));
  await ui.findByText('Retry save');
  ui.rerender(renderScene(refreshed));
  fireEvent.press(ui.getByText('Retry save'));
  await waitFor(() => expect(original.start).toHaveBeenCalledTimes(2));
  expect(refreshed.start).not.toHaveBeenCalled();
});

test('the editorial store flag opens only cafe drafts without developer review tools', async () => {
  mockPreview = false;
  mockCafeOverride = true;
  const ui = scene();
  expect(await ui.findByText('Start visit')).toBeTruthy();
  expect(ui.getByText('Draft practice')).toBeTruthy();
});

async function finishSavedVisit(index: number) {
  const def = ADVENTURES[index];
  const { ALL_DECKS } = require('../../src/data/decks');
  const a = createAdventureAdapter(def.pack.id, 'preview', () => ALL_DECKS);
  let run = await a.start(`screen-visit-${index}`, 100);
  let seq = 0;
  const command = (type: 'advance' | 'answer', extra = {}) => ({
    id: `screen-op-${index}-${++seq}`,
    type,
    runId: run.id,
    nodeId: run.nodeId,
    expectedRevision: run.revision,
    at: 100 + seq,
    ...extra,
  });
  while (!run.completed) {
    const node = def.pack.nodes.find((n) => n.id === run.nodeId)!;
    if (node.kind === 'production' || node.kind === 'choice')
      run = await a.apply(
        command(
          'answer',
          node.kind === 'production'
            ? { answer: node.exercise.acceptedAnswers[0], durationMs: 5 }
            : { choiceId: node.options.find((o) => o.correct)!.id, durationMs: 5 },
        ),
      );
    run = await a.apply(command('advance'));
  }
}

test.each(['en', 'es'] as const)(
  'completion beyond the first café visit names and opens the next mission in %s',
  async (language) => {
    mockLanguage = language;
    await finishSavedVisit(0);
    await finishSavedVisit(1);
    const ui = renderWithTheme(
      <AdventureScreen
        route={{
          params: {
            id: ADVENTURES[1].pack.id,
            mode: 'preview',
          },
        }}
      />,
    );
    const label =
      language === 'en' ? 'Next visit: The bill, please' : 'Próxima visita: La cuenta, por favor';
    fireEvent.press(await ui.findByText(label));
    expect(mockNavigate).toHaveBeenCalledWith('Adventure', {
      id: ADVENTURES[2].pack.id,
      mode: 'preview',
    });
  },
);

test('the final visit keeps the passport available without a next visit', async () => {
  for (let index = 0; index < ADVENTURES.length; index++) await finishSavedVisit(index);
  const ui = renderWithTheme(
    <AdventureScreen
      route={{
        params: {
          id: ADVENTURES[7].pack.id,
          mode: 'preview',
        },
      }}
    />,
  );
  expect(await ui.findByText('Preview stamp earned')).toBeTruthy();
  expect(ui.queryByText(/Next visit:/)).toBeNull();
  fireEvent.press(ui.getByText('Your practice passport'));
  expect(mockNavigate).toHaveBeenCalledWith('Adventures');
});

test('compact passport opens a collection and starts the first visit directly', async () => {
  const ui = renderWithTheme(<AdventuresScreen />);
  fireEvent.press(await ui.findByLabelText('Open passport'));
  expect(await ui.findByText('Your first stamp awaits')).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
  fireEvent.press(ui.getByText('Start your first visit'));
  expect(mockNavigate).toHaveBeenCalledWith('Adventure', {
    id: ADVENTURES[0].pack.id,
    mode: 'preview',
  });
  expect(ui.queryByText('Your first stamp awaits')).toBeNull();
});

test('passport closes back to visits without navigating to the current screen', async () => {
  const ui = renderWithTheme(<AdventuresScreen />);
  fireEvent.press(await ui.findByLabelText('Open passport'));
  fireEvent.press(ui.getByText('Close passport'));
  expect(ui.queryByText('Your first stamp awaits')).toBeNull();
  expect(ui.getByLabelText('Open passport')).toBeTruthy();
  expect(ui.queryByText('Explore adventures')).toBeNull();
  expect(mockNavigate).not.toHaveBeenCalled();
});

test('passport keeps earned stamps and continues the next unlocked visit', async () => {
  await finishSavedVisit(0);
  const ui = renderWithTheme(<AdventuresScreen />);
  expect(await ui.findByText('1 stamp collected')).toBeTruthy();
  expect(ui.getByLabelText('Open passport').props.accessibilityValue).toEqual({
    text: '1 stamp collected',
  });
  fireEvent.press(ui.getByLabelText('Open passport'));
  expect(
    await ui.findByText(/Preview stamp earned · Completed without recorded help/),
  ).toBeTruthy();
  fireEvent.press(ui.getByText('Continue your adventure'));
  expect(mockNavigate).toHaveBeenCalledWith('Adventure', {
    id: ADVENTURES[1].pack.id,
    mode: 'preview',
  });
});

test('passport resumes an unfinished visit', async () => {
  const { ALL_DECKS } = require('../../src/data/decks');
  await createAdventureAdapter(ADVENTURES[0].pack.id, 'preview', () => ALL_DECKS).start(
    'passport-resume',
    100,
  );
  const ui = renderWithTheme(<AdventuresScreen />);
  fireEvent.press(await ui.findByLabelText('Open passport'));
  fireEvent.press(within(ui.getByTestId('passport-collection')).getByText('Resume visit'));
  expect(mockNavigate).toHaveBeenCalledWith('Adventure', {
    id: ADVENTURES[0].pack.id,
    mode: 'preview',
  });
});

test('Spanish passport opens and dismisses its localized collection', async () => {
  mockLanguage = 'es';
  const ui = renderWithTheme(<AdventuresScreen />);
  fireEvent.press(await ui.findByLabelText('Abrir pasaporte'));
  expect(ui.getByText('Tu primer sello te espera')).toBeTruthy();
  fireEvent.press(ui.getByText('Cerrar pasaporte'));
  expect(ui.queryByText('Tu primer sello te espera')).toBeNull();
});

test('a fully stamped passport offers revisits without inventing another visit', async () => {
  for (let index = 0; index < ADVENTURES.length; index++) await finishSavedVisit(index);
  const ui = renderWithTheme(<AdventuresScreen />);
  fireEvent.press(await ui.findByLabelText('Open passport'));
  const collection = within(ui.getByTestId('passport-collection'));
  expect(collection.queryByText('Continue your adventure')).toBeNull();
  expect(collection.queryByText('Start your first visit')).toBeNull();
  fireEvent.press(collection.getByText('Practise again: Breakfast at Ana’s café'));
  expect(mockNavigate).toHaveBeenCalledWith('Adventure', {
    id: ADVENTURES[0].pack.id,
    mode: 'preview',
  });
});
