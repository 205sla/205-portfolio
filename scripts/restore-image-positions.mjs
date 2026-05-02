#!/usr/bin/env node
/**
 * 본문 끝의 `## 첨부 자료` 섹션에 모여 있던 이미지를 본문의
 * H2/H3 헤딩 다음 위치로 자동 재배치.
 *
 * 1회용 — 실행 후 src/content/projects/**\/index.md가 갱신됨.
 *
 * 사용법:
 *   node scripts/restore-image-positions.mjs            # 전체 처리
 *   node scripts/restore-image-positions.mjs <slug-prefix>   # 특정 슬러그만 (디버그)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = resolve(__dirname, '..', 'src/content/projects');
const filterArg = process.argv[2];

const ATTACH_HEADING = /^##\s+첨부\s*자료\s*$/;
const IMG_LINE = /^!\[[^\]]*\]\([^)]+\)\s*$/;
const HEADING = /^(##|###)\s+\S/;

function splitFm(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  return { fmText: m[1], body: m[2] };
}

function* walk(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const sub = join(dir, ent.name);
    if (existsSync(join(sub, 'index.md'))) yield sub;
    else yield* walk(sub);
  }
}

function processFile(indexPath) {
  const raw = readFileSync(indexPath, 'utf-8');
  const split = splitFm(raw);
  if (!split) return { changed: false, reason: 'no-frontmatter' };

  const { fmText, body } = split;
  const lines = body.split('\n');

  // 1) "## 첨부 자료" 섹션 위치
  const attachIdx = lines.findIndex(l => ATTACH_HEADING.test(l));
  if (attachIdx === -1) return { changed: false, reason: 'no-attach' };

  // 2) 첨부 자료 안의 이미지 추출
  const attachLines = lines.slice(attachIdx + 1);
  const images = attachLines
    .map(l => l.trim())
    .filter(l => IMG_LINE.test(l));

  if (images.length === 0) return { changed: false, reason: 'no-images' };

  // 3) 본문 본체 (첨부자료 섹션 + 직전 구분선/빈 줄 제외)
  let bodyEndIdx = attachIdx;
  while (bodyEndIdx > 0 && (lines[bodyEndIdx - 1].trim() === '' || lines[bodyEndIdx - 1].trim() === '---')) {
    bodyEndIdx--;
  }
  const bodyLines = lines.slice(0, bodyEndIdx);

  // 4) H2/H3 헤딩 라인 인덱스 — "첨부 자료" 자체는 이미 본문 본체 밖이므로 제외 불필요
  const headingIdxs = bodyLines
    .map((l, i) => HEADING.test(l) ? i : -1)
    .filter(i => i >= 0);

  // 5) 분배
  let resultLines;
  if (headingIdxs.length === 0) {
    // 헤딩 없음 → 본문 끝에 모두
    resultLines = [...bodyLines];
    for (const img of images) {
      resultLines.push('', img);
    }
  } else {
    const perHeading = Math.ceil(images.length / headingIdxs.length);
    const inserts = [];
    let imgIdx = 0;

    for (let h = 0; h < headingIdxs.length && imgIdx < images.length; h++) {
      const start = headingIdxs[h];
      const end = h + 1 < headingIdxs.length ? headingIdxs[h + 1] : bodyLines.length;

      // 헤딩 다음 첫 단락의 끝(빈 줄)에 이미지 그룹 삽입.
      // 빈 줄을 못 찾으면 헤딩 + 1 (헤딩 바로 다음).
      let insertAt = start + 1;
      // 헤딩 바로 다음 빈 줄은 건너뛰고
      while (insertAt < end && bodyLines[insertAt].trim() === '') insertAt++;
      // 첫 텍스트 단락의 끝(빈 줄)을 찾음
      while (insertAt < end && bodyLines[insertAt].trim() !== '') insertAt++;

      const count = Math.min(perHeading, images.length - imgIdx);
      const grp = images.slice(imgIdx, imgIdx + count);
      inserts.push({ at: insertAt, imgs: grp });
      imgIdx += count;
    }
    if (imgIdx < images.length) {
      inserts.push({ at: bodyLines.length, imgs: images.slice(imgIdx) });
    }

    // 뒤에서부터 삽입 (인덱스 변동 방지)
    inserts.sort((a, b) => b.at - a.at);
    const mut = [...bodyLines];
    for (const ins of inserts) {
      const block = [];
      for (const img of ins.imgs) {
        block.push('');
        block.push(img);
      }
      mut.splice(ins.at, 0, ...block);
    }

    // 끝쪽 잔여 '---'/빈 줄 정리
    while (mut.length && (mut[mut.length - 1].trim() === '' || mut[mut.length - 1].trim() === '---')) {
      mut.pop();
    }

    resultLines = mut;
  }

  const newBody = resultLines.join('\n').replace(/^\n+/, '');
  const out = `---\n${fmText}\n---\n\n${newBody}\n`;
  writeFileSync(indexPath, out, 'utf-8');

  return { changed: true, count: images.length };
}

let changed = 0;
let totalImages = 0;
let skipped = 0;
const skipReasons = {};

for (const dir of walk(CONTENT_ROOT)) {
  const slug = dir.split(/[\\/]projects[\\/]/)[1].replace(/\\/g, '/');
  if (filterArg && !slug.includes(filterArg)) continue;

  const indexPath = join(dir, 'index.md');
  const r = processFile(indexPath);
  if (r.changed) {
    changed++;
    totalImages += r.count;
    console.log(`[ok] ${slug} — ${r.count} images`);
  } else {
    skipped++;
    skipReasons[r.reason] = (skipReasons[r.reason] ?? 0) + 1;
  }
}

console.log('');
console.log(`✓ updated: ${changed} files (${totalImages} images redistributed)`);
console.log(`× skipped: ${skipped}`);
for (const [reason, n] of Object.entries(skipReasons)) {
  console.log(`    ${reason}: ${n}`);
}
