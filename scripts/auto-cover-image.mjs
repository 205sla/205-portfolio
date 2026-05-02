#!/usr/bin/env node
/**
 * 모든 프로젝트 항목 폴더를 순회해서, 같은 폴더에 이미지 파일이 있으면
 * frontmatter에 cover.image를 자동으로 채워 넣는다.
 *
 * - 이미 cover.image가 설정된 항목은 건드리지 않는다.
 * - 이미지가 없는 항목도 건드리지 않는다.
 * - 여러 이미지가 있을 때 우선순위:
 *     cover.* > thumb*.* > main.* > image.* > image-1.* > image-N.* > 알파벳순
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, '..');
const CONTENT_ROOT = resolve(SITE_ROOT, 'src/content/projects');

const IMG_EXT = /\.(png|jpe?g|gif|webp|svg)$/i;

function score(filename) {
  const lower = filename.toLowerCase();
  if (lower.startsWith('cover.')) return 0;
  if (lower.startsWith('thumb')) return 1;
  if (lower.startsWith('main.')) return 2;
  if (/^image\.(png|jpe?g|gif|webp)$/.test(lower)) return 3;
  if (/^image-1\./.test(lower)) return 4;
  if (/^image-\d+\./.test(lower)) return 5;
  return 10;
}

function* walkProjects(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const subDir = join(dir, ent.name);
    if (existsSync(join(subDir, 'index.md'))) {
      yield subDir;
    } else {
      yield* walkProjects(subDir);
    }
  }
}

let updated = 0;
let skippedNoImage = 0;
let skippedHasImage = 0;
const results = [];

for (const projDir of walkProjects(CONTENT_ROOT)) {
  const indexPath = join(projDir, 'index.md');
  const raw = readFileSync(indexPath, 'utf-8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!fmMatch) continue;

  const [, fmText, body] = fmMatch;
  const data = yaml.load(fmText) ?? {};

  if (data.cover && typeof data.cover === 'object' && data.cover.image) {
    skippedHasImage++;
    continue;
  }

  // 같은 폴더의 이미지 파일 검색
  const files = readdirSync(projDir).filter(f => IMG_EXT.test(f));
  if (files.length === 0) {
    skippedNoImage++;
    continue;
  }

  files.sort((a, b) => {
    const sa = score(a);
    const sb = score(b);
    if (sa !== sb) return sa - sb;
    return a.localeCompare(b, 'ko');
  });
  const pick = files[0];

  // frontmatter 갱신
  data.cover = data.cover ?? {};
  data.cover.image = `./${pick}`;

  const newFmText = yaml.dump(data, { lineWidth: 200, quotingType: '"', forceQuotes: false });
  const newContent = `---\n${newFmText}---\n\n${body.replace(/^\n+/, '')}`;
  writeFileSync(indexPath, newContent, 'utf-8');

  const rel = relative(CONTENT_ROOT, projDir).replaceAll('\\', '/');
  results.push({ project: rel, image: pick, candidates: files });
  updated++;
}

console.log('');
for (const r of results) {
  console.log(`[ok] ${r.project}  ←  ${r.image}` + (r.candidates.length > 1 ? `  (out of ${r.candidates.length})` : ''));
}
console.log('');
console.log(`✓ updated:                 ${updated}`);
console.log(`× skipped (already image): ${skippedHasImage}`);
console.log(`× skipped (no image file): ${skippedNoImage}`);
