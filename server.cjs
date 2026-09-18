const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs/promises');
const path = require('node:path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function inside(root, file) {
  const relative = path.relative(root, file);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
}

function checkGoogle() {
  return new Promise((resolve) => {
    let done = false;
    let timer;
    const finish = (value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve({ ...value, checkedAt: new Date().toISOString() });
    };
    const request = https.request(
      'https://www.google.com/maps/',
      {
        method: 'HEAD',
        headers: { 'User-Agent': 'WumingCampusMap/0.2.0' },
      },
      (response) => {
        response.resume();
        finish({
          reachable: response.statusCode >= 200 && response.statusCode < 400,
          status: response.statusCode,
        });
      },
    );
    request.on('error', () => finish({ reachable: false, reason: 'connection_failed' }));
    timer = setTimeout(() => {
      finish({ reachable: false, reason: 'timeout' });
      request.destroy();
    }, 6500);
    request.end();
  });
}

function createServer({ publicDir = PUBLIC_DIR, googleProbe = checkGoogle } = {}) {
  const root = path.resolve(publicDir);
  let pendingProbe = null;
  return http.createServer(async (request, response) => {
    const send = (status, body, type = 'text/plain; charset=utf-8', headers = {}) => {
      response.writeHead(status, {
        'Content-Type': type,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        ...headers,
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    };
    if (!['GET', 'HEAD'].includes(request.method)) {
      send(405, 'Method not allowed', undefined, { Allow: 'GET, HEAD' });
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname.includes('\0')) throw new Error('Invalid path');
    } catch {
      send(400, 'Invalid URL');
      return;
    }
    if (pathname === '/api/app-info') {
      send(
        200,
        JSON.stringify({ name: 'wuming-campus-map', version: '0.2.0' }),
        MIME_TYPES['.json'],
      );
      return;
    }
    if (pathname === '/api/google-map-status') {
      if (!pendingProbe)
        pendingProbe = Promise.resolve()
          .then(googleProbe)
          .finally(() => {
            pendingProbe = null;
          });
      try {
        send(200, JSON.stringify(await pendingProbe), MIME_TYPES['.json']);
      } catch {
        send(
          502,
          JSON.stringify({ reachable: false, reason: 'probe_failed' }),
          MIME_TYPES['.json'],
        );
      }
      return;
    }
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^[/\\]+/, '');
    const file = path.resolve(root, relative);
    if (!inside(root, file)) {
      send(403, 'Forbidden');
      return;
    }
    try {
      const [realRoot, realFile] = await Promise.all([fs.realpath(root), fs.realpath(file)]);
      if (!inside(realRoot, realFile)) {
        send(403, 'Forbidden');
        return;
      }
      if (!(await fs.stat(realFile)).isFile()) {
        send(404, 'Not found');
        return;
      }
      send(
        200,
        await fs.readFile(realFile),
        MIME_TYPES[path.extname(realFile).toLowerCase()] || 'application/octet-stream',
      );
    } catch (error) {
      send(['ENOENT', 'ENOTDIR', 'EISDIR'].includes(error.code) ? 404 : 500, 'File unavailable');
    }
  });
}

function portFromEnvironment() {
  const text = process.env.CAMPUS_PORT || '8120';
  if (!/^\d+$/.test(text) || Number(text) > 65535)
    throw new Error('CAMPUS_PORT must be an integer from 0 to 65535.');
  return Number(text);
}

if (require.main === module) {
  try {
    const server = createServer();
    server.on('error', (error) => {
      console.error(
        error.code === 'EADDRINUSE'
          ? 'Port in use. Choose another CAMPUS_PORT, or run start.cmd on Windows.'
          : error.message,
      );
      process.exitCode = 1;
    });
    server.listen(portFromEnvironment(), '127.0.0.1', () => {
      console.log(`Campus map: http://127.0.0.1:${server.address().port}/`);
      console.log('Press Ctrl+C to stop.');
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { createServer, checkGoogle, portFromEnvironment };
