const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { lanAddress, apiUrl, settings } = require('./environment.cjs');

const networks = {
    'vEthernet (WSL)': [{ family: 'IPv4', internal: false, address: '172.20.0.1' }],
    'Wi-Fi': [{ family: 'IPv4', internal: false, address: '192.168.1.50' }],
    'Loopback': [{ family: 'IPv4', internal: true, address: '127.0.0.1' }],
};
test('physical phone gets LAN IP instead of loopback or virtual network', () => {
    assert.equal(lanAddress(networks), '192.168.1.50');
    assert.equal(apiUrl({}, [], networks), 'http://192.168.1.50:8081/api/v1');
    assert.equal(apiUrl({ LAN_IP: '192.168.0.99', API_PORT: '18081' }, [], networks), 'http://192.168.0.99:18081/api/v1');
});
test('web and emulator use addresses reachable from their runtime', () => {
    assert.equal(apiUrl({}, ['--web'], networks), 'http://127.0.0.1:8081/api/v1');
    assert.equal(apiUrl({}, ['--android'], networks), 'http://10.0.2.2:8081/api/v1');
    assert.throws(() => apiUrl({}, [], {}), /LAN/);
});
test('explicit hosted API takes priority and invalid URLs fail before Expo starts', () => {
    assert.equal(apiUrl({ EXPO_PUBLIC_API_BASE_URL: 'https://demo.example.com/api/v1/' }, ['--web']), 'https://demo.example.com/api/v1');
    assert.throws(() => apiUrl({ EXPO_PUBLIC_API_BASE_URL: 'https://demo.example.com' }), /api\/v1/);
    for (const url of ['https://user:secret@demo.example/api/v1', 'https://demo.example/api/v1?token=secret', 'https://demo.example/api/v1#fragment']) {
        assert.throws(() => apiUrl({ EXPO_PUBLIC_API_BASE_URL: url }), /EXPO_PUBLIC_API_BASE_URL/);
    }
    assert.throws(() => apiUrl({ API_PORT: '99999' }, ['--web']), /API_PORT/);
    assert.throws(() => apiUrl({ LAN_IP: 'http://192.168.0.1' }), /LAN_IP/);
});
test('dotenv quoting and shell > mobile > root precedence', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'troday-env-'));
    try {
        fs.mkdirSync(path.join(dir, 'FE_Mobile'));
        fs.writeFileSync(path.join(dir, '.env'), 'API_PORT=18081\nEXPO_PUBLIC_API_BASE_URL="https://root.example/api/v1"\n');
        fs.writeFileSync(path.join(dir, 'FE_Mobile/.env'), 'EXPO_PUBLIC_API_BASE_URL="https://mobile.example/api/v1"\n');
        assert.equal(settings({}, dir).API_PORT, '18081');
        assert.equal(settings({}, dir).EXPO_PUBLIC_API_BASE_URL, 'https://mobile.example/api/v1');
        assert.equal(settings({ EXPO_PUBLIC_API_BASE_URL: 'https://shell.example/api/v1' }, dir).EXPO_PUBLIC_API_BASE_URL, 'https://shell.example/api/v1');
    } finally {
        for (const file of ['.env', 'FE_Mobile/.env']) fs.unlinkSync(path.join(dir, file));
        fs.rmdirSync(path.join(dir, 'FE_Mobile'));
        fs.rmdirSync(dir);
    }
});
