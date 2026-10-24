import { mkdtempSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

// Compile isolated pure modules with the project's pinned compiler; no new runner dependency.
const directory = mkdtempSync(join(tmpdir(), 'twitch-survivors-tests-'));
const roots = ['src/audience', 'src/systems/ViewerRegistry.ts', 'tests'];
function compile(path) {
  if (!path.endsWith('.ts')) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      if (entry.isDirectory() || entry.name.endsWith('.ts')) compile(join(path, entry.name));
    }
    return;
  }
  const output = join(directory, relative(process.cwd(), path).replace(/\.ts$/, '.js'));
  const result = ts.transpileModule(readFileSync(path, 'utf8'), {
    fileName: path,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, result.outputText);
}
try {
  writeFileSync(join(directory, 'package.json'), '{"type":"commonjs"}');
  roots.forEach(compile);
  const tests = readdirSync(join(directory, 'tests')).filter(name => name.endsWith('.test.js')).map(name => join(directory, 'tests', name));
  if (!tests.length) throw new Error('No audience tests found');
  const result = spawnSync(process.execPath, ['--test', '--test-concurrency=1', ...tests], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(directory, { recursive: true, force: true });
}
