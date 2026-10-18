#!/usr/bin/env python3
"""Read-only simulator data-container preflight; never repairs or writes state."""
import argparse
import json
import subprocess
from pathlib import Path
from uuid import UUID


def validate_container(device: str, container: Path, devices_root: Path) -> dict:
    try:
        device = str(UUID(device)).upper()
    except (ValueError, AttributeError) as error:
        raise ValueError('An explicit device UUID is required; aliases are not accepted') from error
    devices_root = devices_root.expanduser().absolute()
    expected = devices_root / device / 'data'
    # Resolve only the shared base. Resolving the requested suffix could bless
    # a device/data directory that itself aliases another simulator.
    resolved_expected = devices_root.resolve() / device / 'data'
    container = container.expanduser()
    try:
        relative = container.relative_to(expected)
        resolved_relative = container.resolve().relative_to(resolved_expected)
    except ValueError as error:
        raise ValueError(f'Container is outside requested device {device}: {container}') from error
    for candidate in [relative, resolved_relative]:
        if len(candidate.parts) != 4 or candidate.parts[:3] != ('Containers', 'Data', 'Application'):
            raise ValueError('Expected an application container root, not an app file or shared group')
        try:
            UUID(candidate.name)
        except ValueError as error:
            raise ValueError('Expected an application container root with a UUID name') from error
    return {
        'isolated': True,
        'requestedDevice': device,
        'expectedDataRoot': str(expected),
        'container': str(container),
        'resolvedContainer': str(container.resolve()),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('device', help='Explicit simulator UUID; never booted/all')
    parser.add_argument('--bundle', default='com.mikepitts.colombianspanish')
    args = parser.parse_args()
    try:
        UUID(args.device)
        result = subprocess.run(
            ['xcrun', 'simctl', 'get_app_container', args.device, args.bundle, 'data'],
            check=True, capture_output=True, text=True, timeout=15,
        )
        report = validate_container(
            args.device, Path(result.stdout.strip()),
            Path.home() / 'Library/Developer/CoreSimulator/Devices',
        )
    except (ValueError, OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as error:
        print(json.dumps({'isolated': False, 'requestedDevice': args.device,
                          'bundle': args.bundle, 'error': str(error)}, indent=2))
        return 1
    print(json.dumps({**report, 'bundle': args.bundle}, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
