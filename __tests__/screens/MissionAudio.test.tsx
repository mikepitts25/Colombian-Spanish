import React from 'react';
import { AppState } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import MissionAudio from '../../src/components/MissionAudio';
import { listeningPack } from '../../testFixtures/listening';
import { ListeningNode } from '../../src/missions/schema';
import { startMission } from '../../src/missions/engine';
import { speakCard, stop } from '../../src/services/tts';
jest.mock('../../src/services/tts', () => ({ speakCard: jest.fn(), stop: jest.fn() }));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any) => require('../../src/i18n/translations').translate('en', key),
  }),
}));
const node = listeningPack.nodes[0] as ListeningNode;
const run = startMission(listeningPack, 'audio-run', 1000);
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
});
afterEach(() => jest.restoreAllMocks());
function deferred() {
  let resolve!: (value: any) => void;
  (speakCard as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  return {
    finish: async () => {
      await act(async () => resolve({ source: 'generated', loop: false }));
    },
  };
}
test('background and unmount cancel a pending playback without writing evidence', async () => {
  let change!: (state: any) => void;
  const listener = jest.spyOn(AppState, 'addEventListener').mockImplementation((_, cb: any) => {
    change = cb;
    return { remove: jest.fn() };
  });
  const onCommand = jest.fn();
  const pending = deferred();
  const ui = render(<MissionAudio node={node} run={run} disabled={false} onCommand={onCommand} />);
  expect(speakCard).not.toHaveBeenCalled();
  fireEvent.press(ui.getByText('Play / replay'));
  act(() => change('background'));
  await pending.finish();
  expect(onCommand).not.toHaveBeenCalled();
  const next = deferred();
  fireEvent.press(ui.getByText('Play / replay'));
  ui.unmount();
  await next.finish();
  expect(onCommand).not.toHaveBeenCalled();
  expect(stop).toHaveBeenCalled();
  listener.mockRestore();
});
test('a changed revision cancels a stale result and allows another explicit play', async () => {
  const onCommand = jest.fn(),
    pending = deferred();
  const ui = render(<MissionAudio node={node} run={run} disabled={false} onCommand={onCommand} />);
  fireEvent.press(ui.getByText('Play / replay'));
  ui.rerender(
    <MissionAudio
      node={node}
      run={{ ...run, revision: 1 }}
      disabled={false}
      onCommand={onCommand}
    />,
  );
  await pending.finish();
  expect(onCommand).not.toHaveBeenCalled();
  (speakCard as jest.Mock).mockResolvedValue({ source: 'generated', loop: false });
  await act(async () => fireEvent.press(ui.getByText('Play / replay')));
  expect(onCommand).toHaveBeenCalledWith('playback');
});
test('replay uses the selected speed and loop without duplicating saved playback', async () => {
  const onCommand = jest.fn();
  (speakCard as jest.Mock).mockResolvedValue({ source: 'generated', loop: true });
  const ui = render(
    <MissionAudio
      node={node}
      run={{ ...run, audioPlayed: true }}
      disabled={false}
      onCommand={onCommand}
    />,
  );
  fireEvent.press(ui.getByText('0.75×'));
  fireEvent.press(ui.getByText('Repeat clip · Off'));
  await act(async () => fireEvent.press(ui.getByText('Play / replay')));
  expect(speakCard).toHaveBeenCalledWith(
    { id: 'c1', front: 'hola' },
    { rate: 0.75, loop: true, requireBundled: true },
  );
  expect(onCommand).not.toHaveBeenCalled();
});
