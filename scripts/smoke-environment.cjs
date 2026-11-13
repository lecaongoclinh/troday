const assert = require('node:assert/strict');
const { settings } = require('./environment.cjs');
const config = settings();
const web = `http://127.0.0.1:${config.WEB_PORT || 5173}`;
const api = `http://127.0.0.1:${config.API_PORT || 8081}/api/v1`;

async function request(url, options) {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), ...options });
    assert.equal(response.ok, true, `HTTP ${response.status}: ${url}`);
    const result = await response.json();
    assert.equal(result.success, true);
    return result.data;
}
async function main() {
    const page = await fetch(web, { signal: AbortSignal.timeout(15000) });
    assert.equal(page.ok, true);
    assert.match(await page.text(), /<html/i);
    await request(`${api}/posts`);
    await request(`${web}/api/v1/posts`);
    console.log('OK: Web, BE, MySQL và Web reverse proxy.');
    for (const [name, role] of [['tenant', 'TENANT'], ['landlord', 'LANDLORD'], ['admin', 'ADMIN']]) {
        // Login writes only a temporary auth session in the development database.
        const session = await request(`${web}/api/v1/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: `${name}@troday.test`, password: 'TrodayDemo@123' }),
        });
        try {
            const user = await request(`${api}/me`, { headers: { Authorization: `Bearer ${session.accessToken}` } });
            assert.ok(user.roles.includes(role), `Missing ${role}`);
            console.log(`OK: ${role} login + /me.`);
        } finally {
            await request(`${api}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${session.accessToken}` } });
        }
    }
}
main().catch((error) => { console.error(`Smoke test failed: ${error.message}`); process.exitCode = 1; });
