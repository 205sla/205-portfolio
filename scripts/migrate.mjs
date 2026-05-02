#!/usr/bin/env node
/**
 * 1회용 마이그레이션 스크립트.
 *   루트 포트폴리오/{게임개발,웹사이트,엔트리,공모전,기타활동}/.../README.md
 * 를 읽어 src/content/projects/<category>/<slug>/index.md 로 변환한다.
 *
 * 동작:
 *  - 기존 README의 H1 → frontmatter.title
 *  - 본문 상단 인용 블록 (> **카테고리**: ..., > **태그**: ..., > **노션 원본**: URL)
 *    을 frontmatter 필드로 흡수
 *  - 디렉토리명을 영문 슬러그로 정규화 (SLUG_MAP 참조)
 *  - 이미지 파일은 그대로 복사 (한글 파일명 유지)
 *  - 누락 필드는 frontmatter에 비어 있게 두고 (사용자가 수동 보정)
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, basename, join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, '..');
const CONTENT_ROOT = resolve(SITE_ROOT, 'src/content/projects');
const PORTFOLIO_ROOT = resolve(SITE_ROOT, '..'); // C:/Users/young/prg/포트폴리오

/* ── 카테고리 폴더 매핑 ─────────────────────────────────────── */
const CATEGORY_MAP = [
  { folder: '게임개발',   category: 'game',    nested: false },
  { folder: '웹사이트',   category: 'web',     nested: false },
  { folder: '공모전',     category: 'contest', nested: false },
  { folder: '기타활동',   category: 'etc',     nested: 'highschool' }, // 안에 고등학교/ 하위
  // 엔트리는 3개 하위
  { folder: '엔트리/사이트-내-성과', category: 'entry', subcategory: 'site-achievement' },
  { folder: '엔트리/교육-성과',      category: 'entry', subcategory: 'education' },
  { folder: '엔트리/웹-개발',        category: 'entry', subcategory: 'web-dev' },
];

/* ── 슬러그 매핑 ────────────────────────────────────────────── */
const SLUG_MAP = {
  // 게임개발
  'gpb-physics': 'gpb-physics',
  'shorts-2d-충돌-시뮬레이션': 'shorts-2d-collision-sim',
  'sow-그리드-에디터': 'sow-grid-editor',
  'unity-수학-학습앱': 'unity-math-app',
  'unity-스파이-게임': 'unity-spy-game',
  'unity-체스스톤': 'unity-chesstone',
  'unreal-한울': 'unreal-haneul',
  '심플한-퍼즐게임': 'chain-puzzle',
  // 웹사이트
  '코난-몰아보기-사이트': 'conan-guide',
  '포트폴리오-사이트-제작': 'portfolio-site',
  // 공모전
  '2019-국립과천과학관-과학동영상-공모대회': '2019-science-video-contest',
  '2020-2021-ftc': '2020-2021-ftc',
  '2020-네이버-클로바버딩-공모전': '2020-naver-clovabuding',
  '2021-2022-ftc': '2021-2022-ftc',
  '2022-메타버스-개발자-경진대회': '2022-metaverse-contest',
  // 기타활동
  'movement-algorithms-시각화': 'movement-algorithms-viz',
  'ui-자동화': 'ui-automation',
  '게임-플레이': 'game-play',
  '고등학교': '__highschool_dir__', // 컨테이너 폴더, 마이그레이션 시 풀어냄
  '공부-기록': 'study-log',
  '구글-지역-가이드': 'google-local-guide',
  '디자인적-사고-ar앱-기획': 'design-thinking-ar',
  '상표권-취득': 'trademark',
  '알고리즘-공부': 'algorithm-study',
  '언론보도': 'press',
  '유니티-튜토리얼-모음': 'unity-tutorials',
  '읽은-책': 'books-read',
  '자격증': 'certifications',
  '테마파크-덕후': 'theme-park-fan',
  '효율적인-가족-여행-영상-제작': 'family-trip-video',
  // 고등학교 하위
  '화정고-입시-챗봇': 'hwajung-admission-bot',
  '마스크-착용-식별-프로그램': 'mask-detection-app',
  // 엔트리/사이트-내-성과
  '2017-엔트리-100만-공모전': '2017-entry-1m-contest',
  '2018-엔트리-4주년-공모전': '2018-entry-4th-anniversary',
  '2023-엔트리-10주년-우수-유저상': '2023-entry-10th-best-user',
  '엔트리-10주년-다큐멘터리': 'entry-10th-documentary',
  '엔트리-스태프-선정': 'entry-staff-pick',
  '엔트리-시작하기-가이드-공모전': 'entry-start-guide-contest',
  '엔트리-합작-진행': 'entry-collaboration',
  // 엔트리/교육-성과
  '205와-엔트리-유튜브-운영': 'youtube-205-entry',
  'sef2023': 'sef2023',
  '고양어린이박물관-온라인-부스': 'goyang-museum-online-booth',
  '넥스트-챌린지-협업': 'next-challenge-collab',
  '엔트리-교육-콘텐츠-제작': 'entry-education-content',
  '엔트리-대회-개최': 'entry-tournament-host',
  '엔트리-비대면-실시간-강의': 'entry-online-live-class',
  '엔트리-자문단': 'entry-advisory',
  '엔트리-책-지필1': 'entry-book-1',
  '엔트리-책-지필2': 'entry-book-2',
  '이솦-ebs': 'isop-ebs',
  '지식in': 'naver-kin',
  '커뮤니티-운영': 'community-management',
  '융합과학-체험마당': 'convergence-science-fair',
  // 엔트리/웹-개발
  'code-205': 'code-205',
  '엔트리-merge-크롬-확장': 'entry-merge-extension',
  '엔트리-vibe-coding': 'entry-vibe-coding',
  '엔트리-단축-링크-서비스': 'entry-shorturl',
  '엔트리-도구-모음-사이트': 'entry-tools',
  '엔트리-디버거-크롬-확장': 'entry-debugger-extension',
  '엔트리-세이브-매니저-크롬-확장': 'entry-save-manager-extension',
  '엔트리-유저-통계-랭킹': 'entry-user-stats',
  '엔트리-작품-합치기-프로그램': 'entry-merge-projects',
  '엔트리-질문-채널-안내': 'help-entry',
};

/* ── 메타 인용 블록 파서 ───────────────────────────────────── */
function parseMetaBlock(body) {
  const lines = body.split(/\r?\n/);
  const meta = {};
  let i = 0;

  // skip H1
  while (i < lines.length && !/^#\s+/.test(lines[i])) i++;
  if (i < lines.length && /^#\s+/.test(lines[i])) i++;

  // skip blank
  while (i < lines.length && !lines[i].trim()) i++;

  // 인용 블록 (>) 까지 모음
  const quoteLines = [];
  while (i < lines.length && lines[i].startsWith('> ')) {
    quoteLines.push(lines[i].slice(2));
    i++;
  }

  for (const line of quoteLines) {
    const m = line.match(/^\*\*([^*]+)\*\*\s*[::]\s*(.+)$/);
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim();
    meta[key] = val;
  }

  // 메타 블록 + 빈 줄 + ---/--- 구분선 다음을 본문으로 사용
  while (i < lines.length && (!lines[i].trim() || /^---+\s*$/.test(lines[i]))) i++;
  const restBody = lines.slice(i).join('\n');

  return { meta, restBody };
}

function extractH1(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function parseMarkdownLink(s) {
  const m = s.match(/^\[([^\]]+)\]\(([^)]+)\)\s*\(?(.*)?\)?\s*$/);
  if (!m) return { url: s, label: undefined };
  return { label: m[1], url: m[2] };
}

function extractFirstParagraph(body, maxLen = 200) {
  const lines = body.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i].trim();
    if (!ln) continue;
    if (ln.startsWith('#')) continue;
    if (ln.startsWith('>')) {
      const stripped = ln.replace(/^>\s*/, '');
      if (stripped) return stripped.slice(0, maxLen);
      continue;
    }
    if (ln.startsWith('|') || ln.startsWith('!') || ln.startsWith('-')) continue;
    return ln.slice(0, maxLen);
  }
  return '';
}

/* ── 디렉토리 walk ─────────────────────────────────────────── */
function* walkProjectDirs(rootPath, isHighschool = false) {
  if (!existsSync(rootPath)) return;
  const entries = readdirSync(rootPath, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
    if (ent.name === '_assets' || ent.name === 'dist') continue;
    const dirPath = join(rootPath, ent.name);
    const readmePath = join(dirPath, 'README.md');
    if (existsSync(readmePath)) {
      yield { name: ent.name, path: dirPath, readmePath, isHighschool };
    }
    // 고등학교 하위는 한 단계 더
    if (ent.name === '고등학교') {
      yield* walkProjectDirs(dirPath, true);
    }
  }
}

/* ── 마이그레이션 실행 ────────────────────────────────────── */
function migrate() {
  let totalMigrated = 0;
  let totalSkipped = 0;
  const issues = [];

  for (const { folder, category, subcategory, nested } of CATEGORY_MAP) {
    const sourceRoot = resolve(PORTFOLIO_ROOT, folder);
    if (!existsSync(sourceRoot)) {
      console.log(`[skip] folder not found: ${folder}`);
      continue;
    }

    for (const proj of walkProjectDirs(sourceRoot)) {
      if (proj.name === '고등학교') continue; // 컨테이너 폴더는 자체로 항목 X

      const slug = SLUG_MAP[proj.name];
      if (!slug || slug === '__highschool_dir__') {
        console.warn(`[warn] no slug mapping for: ${proj.name} — skipping`);
        issues.push({ folder, name: proj.name, reason: 'no slug mapping' });
        totalSkipped++;
        continue;
      }

      // 고등학교 항목은 subcategory: highschool
      const sub = proj.isHighschool ? 'highschool' : subcategory;

      const sourceReadme = readFileSync(proj.readmePath, 'utf-8');
      const title = extractH1(sourceReadme) ?? proj.name;
      const { meta, restBody } = parseMetaBlock(sourceReadme);

      // 카테고리별 cover.style default (디자이너 시안의 톤 매핑)
      const COVER_DEFAULT = {
        game: 'mood', web: 'mint', entry: 'pink', contest: 'cream', etc: 'cream',
      };

      // frontmatter 빌드
      const fm = {
        title,
        category,
      };
      if (sub) fm.subcategory = sub;
      fm.cover = { style: COVER_DEFAULT[category] ?? 'cream' };

      const tagsRaw = meta['태그'];
      if (tagsRaw) {
        const tags = tagsRaw.split(/[,，]/).map(t => t.trim()).filter(Boolean);
        const yearTag = tags.find(t => /^20\d{2}/.test(t));
        if (yearTag) {
          const m = yearTag.match(/(\d{4})/);
          if (m) fm.year = Number(m[1]);
        }
        fm.tags = tags;
      }

      const team = meta['팀 구성'];
      if (team) fm.team = team;

      const role = meta['역할'];
      if (role) fm.role = role;

      const dateRange = meta['기간'];
      if (dateRange) fm.dateRange = dateRange;

      const links = {};
      const notion = meta['노션 원본'];
      if (notion) {
        const { url } = parseMarkdownLink(notion.replace(/^<|>$/g, ''));
        links.notion = url || notion;
      }
      const github = meta['깃허브'] || meta['GitHub'];
      if (github) {
        const m = github.match(/https?:\/\/[^\s)>]+/);
        if (m) links.github = m[0];
      }
      const youtube = meta['유튜브'] || meta['YouTube'];
      if (youtube) {
        const m = youtube.match(/https?:\/\/[^\s)>]+/);
        if (m) links.youtube = m[0];
      }
      const store = meta['스토어'] || meta['앱 스토어'] || meta['Play 스토어'];
      if (store) {
        const m = store.match(/https?:\/\/[^\s)>]+/);
        if (m) links.store = m[0];
      }
      const site = meta['사이트'] || meta['도메인'] || meta['운영 도메인'];
      if (site) {
        const m = site.match(/https?:\/\/[^\s)>]+/);
        if (m) links.site = m[0];
      }
      if (Object.keys(links).length > 0) fm.links = links;

      fm.description = extractFirstParagraph(restBody) || `${title}에 관한 기록.`;

      // 출력 위치
      const outDir = subcategory
        ? resolve(CONTENT_ROOT, category, subcategory, slug)
        : (proj.isHighschool
          ? resolve(CONTENT_ROOT, category, 'highschool', slug)
          : resolve(CONTENT_ROOT, category, slug));

      mkdirSync(outDir, { recursive: true });

      // 본문 생성
      const yamlBlock = yaml.dump(fm, { lineWidth: 200, quotingType: '"' });
      const out = `---\n${yamlBlock}---\n\n${restBody.trimStart()}\n`;
      writeFileSync(join(outDir, 'index.md'), out, 'utf-8');

      // 이미지 등 자산 복사
      const projAssets = readdirSync(proj.path);
      for (const f of projAssets) {
        if (f === 'README.md') continue;
        const src = join(proj.path, f);
        if (statSync(src).isDirectory()) continue;
        copyFileSync(src, join(outDir, f));
      }

      totalMigrated++;
      console.log(`[ok] ${category}${sub ? '/' + sub : ''}/${slug}  ←  ${folder}/${proj.name}`);
    }
  }

  console.log('');
  console.log(`✓ migrated: ${totalMigrated}`);
  console.log(`× skipped:  ${totalSkipped}`);
  if (issues.length > 0) {
    console.log('issues:');
    for (const it of issues) console.log(`  - ${it.folder}/${it.name} : ${it.reason}`);
  }
}

migrate();
