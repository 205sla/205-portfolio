# 205 Portfolio Site

이영호(205)의 개인 포트폴리오 사이트. https://205.kr

Astro 기반 정적 사이트입니다. 콘텐츠는 `src/content/projects/<category>/<slug>/index.md` 마크다운 파일로 관리되며, 새 항목 추가/수정/삭제는 마크다운 파일 한 개 작업이면 끝납니다.

> 📖 **사이트 운영 가이드**: [MAINTENANCE.md](MAINTENANCE.md) — 콘텐츠 추가·수정·삭제, 디자인 변경, 배포, 문제 해결까지 일상 운영에 필요한 모든 것이 정리되어 있습니다.

## 디렉토리 구조

```
.
├── _reference/                  # 디자이너 원본 시안 (read-only)
├── public/                      # 정적 자산 (폰트, 이미지)
│   ├── assets/
│   └── fonts/
├── scripts/
│   └── migrate.mjs              # 1회용 마이그레이션 (실행 완료)
├── src/
│   ├── components/              # Astro 컴포넌트
│   │   ├── ProjectCard.astro
│   │   ├── WorksGallery.astro
│   │   └── project/
│   │       ├── ProjectHeader.astro
│   │       └── RelatedNav.astro
│   ├── content/
│   │   └── projects/            # 콘텐츠 컬렉션 (62개 항목)
│   │       ├── game/
│   │       ├── web/
│   │       ├── entry/{site-achievement,education,web-dev}/
│   │       ├── contest/
│   │       └── etc/{,highschool/}
│   ├── content.config.ts        # zod 스키마
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── project/             # 4 variant layouts
│   │       ├── ProjectBase.astro
│   │       ├── LongLayout.astro
│   │       ├── MediumLayout.astro
│   │       ├── ShortLayout.astro
│   │       └── EmptyLayout.astro
│   ├── lib/
│   │   ├── labels.ts            # 카테고리 라벨 매핑
│   │   └── variant.ts           # 본문 길이로 variant 자동 선택
│   ├── pages/
│   │   ├── index.astro          # 메인
│   │   └── projects/
│   │       └── [...slug].astro  # 동적 라우트 (62 페이지)
│   └── styles/
│       ├── tokens.css           # 디자인 토큰 + @font-face
│       ├── site.css             # 메인 페이지
│       └── project-detail.css
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 일상 명령

```bash
npm install              # 1회
npm run dev              # http://localhost:4321/
npm run build            # dist/ 생성 (astro check 포함)
npm run preview          # 빌드 결과 로컬 서버
```

## 새 항목 추가 워크플로

1. `src/content/projects/<category>/<slug>/index.md` 작성. `<category>`는 `game / web / entry / contest / etc` 중 하나.
2. 같은 폴더에 이미지/영상 자산 함께 두기.
3. `npm run dev`로 즉시 미리보기. 갤러리에 카드가 자동 등장하고 카운트도 +1.
4. `git add . && git commit -m "..."` & `git push`.

### 최소 frontmatter 예시

```yaml
---
title: "[Unity] 별빛 슈터"
category: game
year: 2026
team: "1인 개발"
tags: ["Unity", "Shooter"]
description: "탑다운 슈터 1주일 잼 결과물."
catLabel: "Game · Unity"
cover:
  style: mood     # mint / pink / mood / cream
  icon: "✦"
links:
  github: "https://github.com/205sla/star-shooter"
  youtube: "https://youtu.be/xxx"
  notion: "https://www.notion.so/..."
---

## 개요

여기에 본문을 자유롭게 작성합니다.

![메인 화면](main.png)

## 핵심 시스템
...
```

### 사용 가능한 frontmatter 필드 (전체)

`src/content.config.ts`의 zod 스키마 참조. 핵심 필드:

| 필드 | 타입 | 설명 |
|------|------|------|
| `title` | string ★ | 항목 제목 |
| `category` | enum ★ | `game / web / entry / contest / etc` |
| `subcategory` | enum | `site-achievement / education / web-dev / highschool` (옵션) |
| `description` | string ★ | 카드 한 줄 설명 |
| `year` | number/string | `2026`, `"—"`, `"2017–2025"` 등 |
| `dateRange` | string | `"2022.12"`, `"2020 — 2021"` |
| `team` | string | `"1인 개발"`, `"5인"` |
| `tags` | string[] | `["Unity", "Released"]` |
| `cover.style` | enum | `mint / pink / mood / cream` (default: cream) |
| `cover.icon` | string | `"♚"`, `"🎮"` |
| `cover.label` | string | 큰 텍스트 (예: `"205.kr"`) |
| `cover.badge` | string | 작은 라벨 (예: `"Unreal · 5인"`) |
| `cover.aspect` | enum | `1 / 4-5 / 3-4 / 4-3 / 16-9 / 16-10` |
| `featured` | boolean | 큰 카드(`.feat`)로 표시 |
| `catLabel` | string | 카드의 cat 라벨 (예: `"Game · Unity"`) |
| `result` | string | 수상 결과 (예: `"장려상"`) |
| `external_only` | boolean | `true`면 empty variant 강제 |
| `variant` | enum | `long / medium / short / empty` (지정하지 않으면 본문 길이로 자동) |
| `links.github` / `youtube` / `store` / `site` / `notion` 등 | URL | 외부 링크 |
| `order` | number | 같은 카테고리 내 수동 정렬 |
| `draft` | boolean | `true`면 빌드 제외 |

★ = 필수.

## 상세 페이지 variant 자동 선택

`src/lib/variant.ts`의 `resolveVariant()`가 다음 룰로 자동 선택합니다:

- frontmatter `variant:` 명시 → 그 값
- `external_only: true` → `empty`
- 본문 80자 미만 → `empty`
- H2가 3개 이상 → `long`
- 본문 600자 미만 → `short`
- 그 외 → `medium`

## 배포

GitHub `main` 브랜치 푸시 시 Cloudflare Pages가 자동 빌드/배포합니다.
- preset: Astro
- build: `npm run build`
- output: `dist`

## 마이그레이션 출처

본 사이트는 노션 기반 포트폴리오에서 마이그레이션되었습니다.

- 디자이너 원본 시안: `_reference/portfolio.html`, `_reference/project-detail.html` (read-only)
- 콘텐츠 원본 백업: `../{게임개발,웹사이트,엔트리,공모전,기타활동}/` (보존)
- 마이그레이션 스크립트: `scripts/migrate.mjs` (1회용, 실행 완료 — 재실행 시 `src/content/projects/` 덮어쓰기)
