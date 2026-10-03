#!/usr/bin/env node
// 快速檢查 index.html：抽出每段 inline <script>，用 Node 做語法檢查。
// 用法：node scripts/check.mjs   （不需安裝任何套件）
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const file = process.argv[2] || 'index.html';
const html = readFileSync(file, 'utf8');
const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
const dir = mkdtempSync(join(tmpdir(), 'check-'));
let i = 0, failed = 0, m;
while ((m = re.exec(html))) {
  i++;
  const line = html.slice(0, m.index).split('\n').length;
  const p = join(dir, `script${i}.js`);
  writeFileSync(p, m[1]);
  try {
    execFileSync(process.execPath, ['--check', p], { stdio: 'pipe' });
    console.log(`ok   <script> #${i} (line ${line})`);
  } catch (e) {
    failed++;
    console.error(`FAIL <script> #${i} (line ${line})\n${String(e.stderr).slice(0, 2000)}`);
  }
}
rmSync(dir, { recursive: true, force: true });
if (i === 0) { console.error('no <script> found'); process.exit(1); }
process.exit(failed ? 1 : 0);
