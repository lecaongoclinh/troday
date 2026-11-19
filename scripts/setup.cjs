const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { root } = require('./environment.cjs');

const destination = path.join(root, '.env');
if (!fs.existsSync(destination)) {
    fs.copyFileSync(path.join(root, '.env.example'), destination, fs.constants.COPYFILE_EXCL);
    console.log('Đã tạo .env từ cấu hình phát triển mẫu.');
} else {
    console.log('Giữ cấu hình .env hiện có.');
}
// npm run provides npm_execpath on Windows/macOS/Linux. Invoking it through Node
// also avoids .cmd shell quoting and paths containing spaces or Vietnamese.
const npmCli = process.env.npm_execpath;
if (!npmCli || !fs.existsSync(npmCli)) {
    console.error('Chạy script qua npm run setup.');
    process.exit(1);
}
const installed = spawnSync(process.execPath, [npmCli, 'ci', '--no-audit', '--no-fund'], {
    cwd: path.join(root, 'FE_Mobile'), stdio: 'inherit',
});
if (installed.error) console.error(installed.error.message);
if (installed.error || installed.status !== 0) {
    console.error('Nếu Windows báo khóa ngrok.exe: dừng Expo/Metro của repo rồi chạy lại npm run setup.');
    process.exit(installed.status || 1);
}
console.log('\nSẵn sàng: npm run dev (Docker), sau đó npm run mobile:web hoặc npm run mobile.');
