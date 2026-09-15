const { spawn } = require('node:child_process');
const { createServer, portFromEnvironment } = require('../server.cjs');

function start(port, tries = 0) {
  const server = createServer();
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && tries < 10 && port < 65535) {
      start(port + 1, tries + 1);
      return;
    }
    console.error(error.message);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${server.address().port}/`;
    console.log(`Campus map: ${url}`);
    console.log('Keep this window open. Press Ctrl+C to stop.');
    if (process.env.CAMPUS_NO_OPEN === '1') return;
    const command =
      process.platform === 'win32'
        ? 'rundll32.exe'
        : process.platform === 'darwin'
          ? 'open'
          : 'xdg-open';
    const args = process.platform === 'win32' ? ['url.dll,FileProtocolHandler', url] : [url];
    const browser = spawn(command, args, { windowsHide: true, stdio: 'ignore' });
    browser.on('error', () => console.log(`Open this address in a browser: ${url}`));
    browser.unref();
  });
}

try {
  start(portFromEnvironment());
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
