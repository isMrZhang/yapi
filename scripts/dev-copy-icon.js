const path = require('path');
const fs = require('fs-extra');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'static', 'iconfont');
const destDir = path.join(rootDir, 'iconfont');

fs.removeSync(destDir);
fs.copySync(srcDir, destDir, { overwrite: true, dereference: true });

