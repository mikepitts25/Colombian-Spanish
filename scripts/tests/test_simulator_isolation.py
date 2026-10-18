"""Scope checks for read-only simulator QA preflight; no real simulator access."""
import tempfile
import contextlib
import io
import json
import sys
from types import SimpleNamespace
from unittest.mock import patch
import unittest
from pathlib import Path
from scripts.simulator_isolation import validate_container, main

DEVICE = '11111111-1111-4111-8111-111111111111'
OTHER = '22222222-2222-4222-8222-222222222222'
APP = '33333333-3333-4333-8333-333333333333'


class SimulatorIsolationTests(unittest.TestCase):
    def test_accepts_own_application_container(self):
        root = Path('/tmp/isolated-simulator-devices')
        container = root / DEVICE / 'data/Containers/Data/Application' / APP
        result = validate_container(DEVICE, container, root)
        self.assertTrue(result['isolated'])
        self.assertEqual(result['requestedDevice'], DEVICE)
        self.assertEqual(result['container'], str(container))

    def test_rejects_another_device_container(self):
        root = Path('/tmp/isolated-simulator-devices')
        container = root / OTHER / 'data/Containers/Data/Application' / APP
        with self.assertRaisesRegex(ValueError, 'outside requested device'):
            validate_container(DEVICE, container, root)

    def test_rejects_child_path_instead_of_container_root(self):
        root = Path('/tmp/isolated-simulator-devices')
        container = root / DEVICE / 'data/Containers/Data/Application' / APP / 'Library'
        with self.assertRaisesRegex(ValueError, 'application container root'):
            validate_container(DEVICE, container, root)

    def test_rejects_non_application_container(self):
        root = Path('/tmp/isolated-simulator-devices')
        container = root / DEVICE / 'data/Containers/Shared/AppGroup' / APP
        with self.assertRaisesRegex(ValueError, 'application container root'):
            validate_container(DEVICE, container, root)

    def test_rejects_resolved_alias_into_another_device(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            own = root / DEVICE / 'data/Containers/Data/Application' / APP
            foreign = root / OTHER / 'data/Containers/Data/Application' / APP
            own.parent.mkdir(parents=True)
            foreign.mkdir(parents=True)
            own.symlink_to(foreign, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, 'outside requested device'):
                validate_container(DEVICE, own, root)

    def test_rejects_malformed_device_identity(self):
        with self.assertRaisesRegex(ValueError, 'device UUID'):
            validate_container('booted', Path('/tmp/container'), Path('/tmp/devices'))


    def test_rejects_aliased_device_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            foreign = root / OTHER / 'data/Containers/Data/Application' / APP
            foreign.mkdir(parents=True)
            (root / DEVICE).symlink_to(root / OTHER, target_is_directory=True)
            own = root / DEVICE / 'data/Containers/Data/Application' / APP
            with self.assertRaisesRegex(ValueError, 'outside requested device'):
                validate_container(DEVICE, own, root)

    def test_rejects_aliased_data_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            foreign = root / OTHER / 'data/Containers/Data/Application' / APP
            foreign.mkdir(parents=True)
            (root / DEVICE).mkdir()
            (root / DEVICE / 'data').symlink_to(root / OTHER / 'data', target_is_directory=True)
            own = root / DEVICE / 'data/Containers/Data/Application' / APP
            with self.assertRaisesRegex(ValueError, 'outside requested device'):
                validate_container(DEVICE, own, root)

    def test_rejects_application_alias_resolving_to_own_shared_group(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            own = root / DEVICE / 'data/Containers/Data/Application' / APP
            shared = root / DEVICE / 'data/Containers/Shared/AppGroup' / APP
            own.parent.mkdir(parents=True)
            shared.mkdir(parents=True)
            own.symlink_to(shared, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, 'application container root'):
                validate_container(DEVICE, own, root)

    def test_cli_refuses_foreign_path_using_only_the_read_only_lookup(self):
        root = Path.home() / 'Library/Developer/CoreSimulator/Devices'
        foreign = root / OTHER / 'data/Containers/Data/Application' / APP
        output = io.StringIO()
        with patch.object(sys, 'argv', ['simulator_isolation.py', DEVICE]), \
             patch('scripts.simulator_isolation.subprocess.run', return_value=SimpleNamespace(stdout=str(foreign))) as lookup, \
             contextlib.redirect_stdout(output):
            self.assertEqual(main(), 1)
        self.assertFalse(json.loads(output.getvalue())['isolated'])
        self.assertEqual(lookup.call_args.args[0], ['xcrun', 'simctl', 'get_app_container', DEVICE, 'com.mikepitts.colombianspanish', 'data'])
        lookup.assert_called_once()

    def test_cli_accepts_own_path(self):
        root = Path.home() / 'Library/Developer/CoreSimulator/Devices'
        own = root / DEVICE / 'data/Containers/Data/Application' / APP
        output = io.StringIO()
        with patch.object(sys, 'argv', ['simulator_isolation.py', DEVICE]), \
             patch('scripts.simulator_isolation.subprocess.run', return_value=SimpleNamespace(stdout=str(own))), \
             contextlib.redirect_stdout(output):
            self.assertEqual(main(), 0)
        self.assertTrue(json.loads(output.getvalue())['isolated'])


if __name__ == '__main__':
    unittest.main()
