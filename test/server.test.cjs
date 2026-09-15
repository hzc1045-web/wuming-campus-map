const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer } = require('../server.cjs');

let server, port;
before(async () => {
  server = createServer({
    googleProbe: async () => ({
      reachable: false,
      reason: 'timeout',
      checkedAt: '2026-09-15T00:00:00Z',
    }),
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});
after(() => new Promise((resolve) => server.close(resolve)));

function request(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: url, method }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () =>
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString(),
        }),
      );
    });
    req.on('error', reject);
    req.end();
  });
}

test('serves the application and local JavaScript modules', async () => {
  const page = await request('/');
  assert.equal(page.status, 200);
  assert.match(page.body, /鸟瞰 3D/);
  const module = await request('/vendor/three.module.js');
  assert.equal(module.status, 200);
  assert.match(module.headers['content-type'], /javascript/);
});
test('serves the generated layout drawing', async () => {
  const image = await request('/assets/layout-overview.svg');
  assert.equal(image.status, 200);
  assert.match(image.headers['content-type'], /image\/svg\+xml/);
  assert.match(image.body, /南大门/);
});
test('HEAD returns headers without a body', async () => {
  const res = await request('/app.js', 'HEAD');
  assert.equal(res.status, 200);
  assert.equal(res.body, '');
});
test('does not serve private project files', async () => {
  for (const target of ['/server.cjs', '/package.json', '/.git/config'])
    assert.equal((await request(target)).status, 404);
  assert.equal((await request('/%2e%2e%2fLICENSE')).status, 403);
});
test('malformed paths do not crash the server', async () => {
  assert.equal((await request('/%E0%A4%A')).status, 400);
  assert.equal((await request('/%00')).status, 400);
  assert.equal((await request('/')).status, 200);
});
test('rejects unsupported methods', async () => {
  assert.equal((await request('/', 'POST')).status, 405);
});
test('Google failures remain explicit JSON rather than satellite imagery', async () => {
  const response = await request('/api/google-map-status');
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(response.body), {
    reachable: false,
    reason: 'timeout',
    checkedAt: '2026-09-15T00:00:00Z',
  });
});
