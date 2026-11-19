const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { root, settings, apiUrl } = require('../../scripts/environment.cjs');

try {
    const args = process.argv.slice(2);
    const config = settings();
    const url = apiUrl(config, args);
    const mobile = path.join(root, 'FE_Mobile');
    const cli = path.join(mobile, 'node_modules', 'expo', 'bin', 'cli');
    if (!fs.existsSync(cli)) throw new Error('Chưa cài thư viện Mobile. Chạy npm run setup từ thư mục gốc repo.');
    console.log(`API Mobile: ${url}`);
    if (args.includes('--android') && !config.EXPO_PUBLIC_API_BASE_URL) {
        console.log('Đang dùng IP Android Emulator. Với điện thoại USB, đặt EXPO_PUBLIC_API_BASE_URL trong .env.');
    }
    if (args.includes('--tunnel')) {
        console.log('Tunnel chỉ phục vụ Expo; điện thoại vẫn cần truy cập được địa chỉ API trên.');
    }
    // Do not forward root MYSQL_* secrets into the Expo build process.
    const publicEnv = Object.fromEntries(Object.entries(config).filter(([key]) => key.startsWith('EXPO_PUBLIC_')));
    const child = spawn(process.execPath, [cli, 'start', '--port', '8082', ...args], {
        cwd: mobile, stdio: 'inherit',
        env: { ...process.env, ...publicEnv, EXPO_PUBLIC_API_BASE_URL: url },
    });
    child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
    child.on('exit', (code) => { process.exitCode = code ?? 1; });
    // Expo shares the console and receives Ctrl+C directly on Windows.
    process.on('SIGINT', () => { if (process.platform !== 'win32') child.kill('SIGINT'); });
    process.on('SIGTERM', () => child.kill('SIGTERM'));
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
