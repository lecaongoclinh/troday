"""Run integration tests with a NEW isolated MySQL instance; never connect to the user's server.

Usage (JDK 21+, MySQL 8+, Maven): python scripts/test-mysql.py --mysql-bin PATH --maven PATH
The generated data/log directory is printed and retained for diagnosis.
"""
import argparse
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mysql-bin', type=Path, default=Path('C:/Program Files/MySQL/MySQL Server 8.0/bin'))
    parser.add_argument('--maven', default=shutil.which('mvn') or str(ROOT / ('mvnw.cmd' if os.name == 'nt' else 'mvnw')))
    args = parser.parse_args()
    suffix = '.exe' if os.name == 'nt' else ''
    mysqld = args.mysql_bin / ('mysqld' + suffix)
    mysql = args.mysql_bin / ('mysql' + suffix)
    admin = args.mysql_bin / ('mysqladmin' + suffix)
    if not all(p.is_file() for p in (mysqld, mysql, admin)):
        parser.error('MySQL server/client binaries not found; supply --mysql-bin')
    directory = Path(tempfile.mkdtemp(prefix='troday-mysql-test-')).resolve()
    assert directory.parent == Path(tempfile.gettempdir()).resolve()
    print('Isolated MySQL data and logs:', directory, flush=True)
    data = directory / 'data'
    hidden = {'creationflags': subprocess.CREATE_NO_WINDOW} if os.name == 'nt' else {}
    with (directory / 'initialize.log').open('wb') as log:
        subprocess.run([str(mysqld), '--no-defaults', '--initialize-insecure', f'--datadir={data}'],
                       stdout=log, stderr=subprocess.STDOUT, check=True, timeout=120, cwd=directory, **hidden)
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    connection = ['--protocol=TCP', '--host=127.0.0.1', f'--port={port}', '--user=root']
    with (directory / 'server.log').open('wb') as log:
        server = subprocess.Popen([str(mysqld), '--no-defaults', f'--datadir={data}', f'--port={port}',
                                   '--bind-address=127.0.0.1', '--mysqlx=OFF', '--skip-log-bin',
                                   '--default-time-zone=+00:00', '--console'], stdout=log, stderr=subprocess.STDOUT, cwd=directory, **hidden)
        try:
            deadline = time.monotonic() + 60
            while time.monotonic() < deadline:
                if server.poll() is not None:
                    raise RuntimeError('Isolated MySQL exited; see server.log')
                ping = subprocess.run([str(admin), '--no-defaults', *connection, 'ping'], capture_output=True, **hidden)
                if ping.returncode == 0:
                    break
                time.sleep(0.5)
            else:
                raise TimeoutError('Isolated MySQL failed to start')
            source = (ROOT.parent / 'database/source/schema.sql').read_bytes()
            migration = (ROOT.parent / 'database/migrations/V001__api_idempotency.sql').read_bytes()
            subprocess.run([str(mysql), '--no-defaults', *connection, '--default-character-set=utf8mb4'],
                           input=source + b'\n' + migration, check=True, **hidden)
            env = os.environ.copy()
            env['TRODAY_MYSQL_TEST_URL'] = f'jdbc:mysql://127.0.0.1:{port}/room_rental_v5_20261023?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true'
            env['TRODAY_MYSQL_TEST_USERNAME'] = 'root'
            env['TRODAY_MYSQL_TEST_PASSWORD'] = ''
            # Do not inherit application debug settings from the workstation into a secret-bearing HTTP test.
            env['DEBUG'] = 'false'
            env['LOGGING_LEVEL_ROOT'] = 'WARN'
            env['LOGGING_LEVEL_ORG_SPRINGFRAMEWORK'] = 'WARN'
            env['SPRING_MAIN_BANNER_MODE'] = 'off'
            command = [args.maven, '-q', 'verify']
            if os.name == 'nt' and args.maven.lower().endswith('.cmd'):
                # cmd /s needs an outer quote pair; a list would backslash-escape the inner quotes.
                command = subprocess.list2cmdline([os.environ.get('COMSPEC', 'cmd.exe'), '/d', '/s', '/c']) + ' "' + subprocess.list2cmdline(command) + '"'
            output = ROOT / 'target/mysql-test.log'
            output.parent.mkdir(parents=True, exist_ok=True)
            with output.open('wb') as test_log:
                started = time.time()
                result = subprocess.run(command, cwd=ROOT, env=env, stdout=test_log, stderr=subprocess.STDOUT)
            print('Maven log:', output, flush=True)
            for report in sorted((ROOT / 'target/surefire-reports').glob('TEST-*.xml')):
                if report.stat().st_mtime < started:
                    continue
                suite = ET.parse(report).getroot()
                print(suite.get('name'), {key: suite.get(key) for key in ['tests', 'failures', 'errors', 'skipped']}, flush=True)
            if result.returncode:
                all_lines = output.read_text(errors='replace').splitlines()
                lines = [line for line in all_lines if line.startswith('[ERROR]')] or all_lines
                print('\n'.join(lines[-35:]), flush=True)
            return result.returncode
        finally:
            subprocess.run([str(admin), '--no-defaults', *connection, 'shutdown'], capture_output=True, timeout=20, **hidden)
            try:
                server.wait(timeout=20)
            except subprocess.TimeoutExpired:
                server.terminate()
                server.wait(timeout=10)


if __name__ == '__main__':
    raise SystemExit(main())
