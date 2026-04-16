const { spawn } = require('child_process');

function run(label, command) {
  const child = spawn(command, {
    shell: true,
    stdio: 'inherit',
    env: process.env
  });
  child.on('exit', code => {
    child.exitCode = typeof code === 'number' ? code : 0;
  });
  child.label = label;
  return child;
}

const server = run('server', 'pnpm run dev-server');
const client = run('client', 'pnpm run dev-client');

let shuttingDown = false;
function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (!server.killed) server.kill();
  if (!client.killed) client.kill();
  process.exit(typeof code === 'number' ? code : 0);
}

server.on('exit', code => shutdown(code));
client.on('exit', code => shutdown(code));

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
