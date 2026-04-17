const path = require('path');
const fs = require('fs-extra');

console.log('⏳ [1/3] 正在复制 iconfont 资源...');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'static', 'iconfont');
const destDir = path.join(rootDir, 'iconfont');

fs.removeSync(destDir);
fs.copySync(srcDir, destDir, { overwrite: true, dereference: true });

console.log('✅ iconfont 资源复制完成.\n');

