const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { parseEnv } = require('node:util');

const root = path.resolve(__dirname, '..');
function readEnv(file) {
    return fs.existsSync(file) ? parseEnv(fs.readFileSync(file, 'utf8')) : {};
}
function settings(env = process.env, directory = root) {
    // Mobile-specific values override root defaults; the shell always wins.
    return {
        ...readEnv(path.join(directory, '.env')),
        ...readEnv(path.join(directory, 'FE_Mobile', '.env')),
        ...env,
    };
}
function lanAddress(interfaces = os.networkInterfaces()) {
    const candidates = Object.entries(interfaces)
        .filter(([name]) => !/loopback|virtual|vethernet|docker|wsl|vpn|tailscale|zerotier|vmware|vbox|utun/i.test(name))
        .flatMap(([name, entries]) => (entries || [])
            .filter((ip) => !ip.internal && ip.family === 'IPv4' && !ip.address.startsWith('169.254.'))
            .map((ip) => ({ name, address: ip.address })))
        .sort((a, b) => Number(!/wi-?fi|wlan|en0/i.test(a.name)) - Number(!/wi-?fi|wlan|en0/i.test(b.name)));
    return candidates[0]?.address;
}
function apiUrl(config, args = [], interfaces) {
    const explicit = config.EXPO_PUBLIC_API_BASE_URL?.trim();
    if (explicit) {
        const url = new URL(explicit);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash
            || !url.pathname.replace(/\/$/, '').endsWith('/api/v1')) {
            throw new Error('EXPO_PUBLIC_API_BASE_URL phải là URL http(s) gồm /api/v1, không chứa tài khoản, query hay fragment.');
        }
        return explicit.replace(/\/$/, '');
    }
    const port = config.API_PORT || '8081';
    if (!/^\d+$/.test(String(port)) || Number(port) < 1 || Number(port) > 65535) {
        throw new Error('API_PORT phải trong khoảng 1–65535.');
    }
    const host = args.includes('--web') ? '127.0.0.1'
        : args.includes('--android') ? '10.0.2.2'
        : config.LAN_IP?.trim() || lanAddress(interfaces);
    if (!host) throw new Error('Không tìm thấy IP LAN. Đặt LAN_IP trong .env hoặc chạy npm run mobile:web.');
    // Require a hostname/IP, not a URL or path accidentally pasted into LAN_IP.
    if (!/^[a-zA-Z0-9.-]+$/.test(host)) throw new Error('LAN_IP chỉ chứa địa chỉ IP hoặc hostname, không gồm http:// hay cổng.');
    return `http://${host}:${port}/api/v1`;
}
module.exports = { root, readEnv, settings, lanAddress, apiUrl };
