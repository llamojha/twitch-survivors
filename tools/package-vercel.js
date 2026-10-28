'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const output = path.join(root, 'dist');
const files = [
  '404.html',
  'favicon.ico',
  'index.html',
  'manifest.webmanifest',
  'robots.txt',
  'version.json'
];
const directories = ['assets', 'css'];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), { recursive: true });
}

fs.mkdirSync(path.join(output, 'js'), { recursive: true });
fs.copyFileSync(path.join(root, 'js', 'app.min.js'), path.join(output, 'js', 'app.min.js'));

console.log(`Vercel package ready in ${output}`);
