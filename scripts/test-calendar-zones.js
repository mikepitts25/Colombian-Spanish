#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');
const project = path.resolve(__dirname, '..');
const jest = path.join(path.dirname(require.resolve('jest/package.json')), 'bin/jest.js');
for (const zone of ['Europe/Berlin', 'America/Bogota', 'America/New_York', 'Pacific/Auckland']) {
  console.log(`Calendar integration: ${zone}`);
  const result = spawnSync(
    process.execPath,
    [jest, '--runInBand', '--runTestsByPath', '__tests__/storage/calendarTransitions.test.ts'],
    {
      cwd: project,
      env: { ...process.env, TZ: zone, CALENDAR_TEST_ZONE: zone },
      stdio: 'inherit',
    },
  );
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
