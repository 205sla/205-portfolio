# 205 포트폴리오 — 사이트 관리 가이드

> 본 문서는 사이트를 운영하면서 자주 하게 될 작업을 정리합니다.
> 콘텐츠 추가·수정·삭제부터 디자인 토큰 변경, 배포 흐름, 문제 해결까지 한 곳에서 다룹니다.

**한 줄 요약**: 새 항목은 `src/content/projects/<카테고리>/<슬러그>/index.md` 만들면 끝. `git push`하면 Cloudflare Pages가 자동 배포.

---

## 목차

1. [빠른 시작](#1-빠른-시작)
2. [콘텐츠 관리](#2-콘텐츠-관리) — 추가 / 수정 / 삭제 / 숨김
3. [frontmatter 필드 레퍼런스](#3-frontmatter-필드-레퍼런스)
4. [상세 페이지 variant 시스템](#4-상세-페이지-variant-시스템)
5. [본문 작성 가이드](#5-본문-작성-가이드)
6. [메인 페이지 정적 데이터 수정](#6-메인-페이지-정적-데이터-수정)
7. [디자인 수정](#7-디자인-수정)
8. [빌드 / 배포](#8-빌드--배포)
9. [자주 발생하는 문제 (FAQ)](#9-자주-발생하는-문제-faq)
10. [백업 / 복원 / 동기화](#10-백업--복원--동기화)
11. [파일 위치 빠른 참조](#11-파일-위치-빠른-참조)

---

## 1. 빠른 시작

### 첫 셋업 (한 번만)
```bash
cd "C:/Users/young/prg/포트폴리오/02. 사이트"
npm install
```

### 일상 명령
```bash
npm run dev        # http://localhost:4321/  (변경사항 즉시 반영)
npm run build      # dist/ 생성 (astro check 자동 포함)
npm run preview    # 빌드된 dist/를 로컬에서 미리보기
```

### 파일을 어디에 둬야 할지 헷갈릴 때
- **새 프로젝트 마크다운** → `src/content/projects/<카테고리>/<슬러그>/index.md`
- **프로젝트 이미지** → 같은 폴더 (`src/content/projects/.../<슬러그>/`)
- **공통 자산 (아이콘, 폰트 등)** → `public/assets/` 또는 `public/fonts/`
- **메인 페이지 텍스트 변경** → `src/pages/index.astro`
- **푸터 변경** → `src/pages/index.astro` (메인) + `src/layouts/project/ProjectBase.astro` (상세)
- **컬러·폰트 토큰** → `src/styles/tokens.css`

---

## 2. 콘텐츠 관리

### 2.1 새 항목 추가 — 가장 자주 할 작업

**시나리오**: "Unity로 새 슈팅 게임을 만들었다, 추가하고 싶다"

```bash
cd "C:/Users/young/prg/포트폴리오/02. 사이트"
mkdir -p src/content/projects/game/unity-shooter
cd src/content/projects/game/unity-shooter
```

`index.md` 작성 (최소 템플릿):
```yaml
---
title: "[Unity] 별빛 슈터"
category: game
year: 2026
team: "1인 개발"
tags: ["Unity", "Shooter"]
description: "탑다운 슈터, 1주일 잼 결과물."
catLabel: "Game · Unity"
cover:
  style: mood
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

이미지 복사:
```bash
cp /path/to/screenshots/*.png .
```

검증 → 푸시:
```bash
cd "C:/Users/young/prg/포트폴리오/02. 사이트"
npm run dev   # 카드가 갤러리에 즉시 등장하는지 확인
git add src/content/projects/game/unity-shooter
git commit -m "feat: add Unity 별빛 슈터"
git push origin main
```

자동 동작:
- 카드 등장 + "전체"/"게임 개발" 카운트 +1
- `/projects/game/unity-shooter/` 라우트 자동 생성
- 같은 카테고리 내 prev/next 자동 재계산
- variant 자동 판정 (본문 길이로 long/medium/short/empty)
- TOC (목차)는 H2가 있으면 자동
- Cloudflare Pages가 푸시 감지 → 2~3분 내 라이브

### 2.2 항목 수정

frontmatter나 본문을 직접 편집:
```bash
# 에디터로 열기
code src/content/projects/game/unity-shooter/index.md
```

**자주 하는 수정**
| 작업 | 어디 |
|------|------|
| 한 줄 설명 변경 | frontmatter `description` |
| 카드 표지 색 변경 | frontmatter `cover.style` (mint/pink/mood/cream) |
| 카드를 "큰 카드"로 강조 | frontmatter `featured: true` |
| 새 외부 링크 추가 | frontmatter `links.youtube` 등, 또는 `links.others[]` |
| 본문에 새 이미지 추가 | 폴더에 이미지 복사 + 본문에 `![설명](파일명.png)` |
| 카테고리 변경 | 폴더를 옮기고 frontmatter `category` 수정 (슬러그/URL도 변경됨) |

### 2.3 항목 삭제

폴더 통째로 삭제:
```bash
rm -rf src/content/projects/game/unity-shooter
git add -A
git commit -m "chore: remove unity-shooter (deprecated)"
git push
```

자동 동작:
- 카드 사라짐, 카운트 −1
- 라우트 사라짐 (404)
- 같은 카테고리 prev/next 재계산

### 2.4 항목 임시 숨기기 (draft)

지우지 않고 일시적으로 사이트에서 빼고 싶을 때:
```yaml
---
title: "..."
draft: true   # 빌드에서 제외
---
```

`draft: true`이면 갤러리·라우트 생성 모두 스킵됩니다. 필요할 때 `false`로 되돌리면 즉시 부활.

### 2.5 카테고리 이동 (예: game → web)

slug가 URL에 박히므로 폴더 이동 + frontmatter 동시 변경:
```bash
git mv src/content/projects/game/unity-shooter src/content/projects/web/unity-shooter
# index.md의 frontmatter
#   category: web
#   cover.style: mint   ← 카테고리 default를 web에 맞게
```

기존 URL을 보존하고 싶으면 redirect 설정 필요 (Cloudflare Pages `_redirects` 파일).

### 2.6 우선순위 / 정렬 / 더보기

**메인 갤러리 정렬 룰** (Works 섹션):
1. `featured: true`인 항목이 먼저
2. `order` 값이 작은 항목이 먼저 (미설정은 `999`로 취급되어 뒤로 밀림)
3. `year` desc (최신이 먼저)

**더보기 동작**:
- 처음에는 정렬 순서대로 **9개**만 표시
- "더보기 +N" 버튼을 누르면 9개씩 추가
- 카테고리 필터를 바꾸면 다시 9개부터 시작

**상위 9개에 강제로 노출하고 싶을 때**:
```yaml
order: 1   # 1, 2, 3 ... 작을수록 상위
```
또는
```yaml
featured: true   # 큰 카드(.feat)로 강조 + 무조건 최상위
```

> 같은 카테고리 안에서의 prev/next(상세 페이지 하단 네비게이션)는 별도 룰을 사용합니다 — `featured` → `year` desc → `order` asc.

---

## 3. frontmatter 필드 레퍼런스

`src/content.config.ts`의 zod 스키마가 진실의 원천입니다. 스키마를 어기면 빌드가 즉시 실패하면서 어느 파일·필드가 문제인지 알려줍니다.

### 필수 필드 (★)

| 필드 | 타입 | 설명 |
|------|------|------|
| `title` ★ | string | 항목 제목 |
| `category` ★ | enum | `game / web / entry / contest / etc` |
| `description` ★ | string | 카드 한 줄 설명 |

### 식별 / 분류

| 필드 | 타입 | 설명 |
|------|------|------|
| `subcategory` | enum | `site-achievement / education / web-dev / highschool` (엔트리·고등학교용) |
| `tags` | string[] | 자유 태그. 카드에 최대 3개 표시 |
| `catLabel` | string | 카드 상단의 "Game · Unity" 같은 라벨 |

### 시간

| 필드 | 타입 | 설명 |
|------|------|------|
| `year` | number 또는 string | `2026`, `"—"`, `"2017–2025"`, `"Now"` 등 |
| `dateRange` | string | `"2022.12"`, `"2020 — 2021"` (상세 페이지용) |

### 사람

| 필드 | 타입 | 설명 |
|------|------|------|
| `team` | string | `"1인 개발"`, `"5인 (레벨 디자인 담당)"` 등 |
| `role` | string | 본인 역할 (옵션) |

### 카드 시각

| 필드 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `cover.style` | enum | `cream` | `mint / pink / mood / cream` |
| `cover.icon` | string | — | 카드의 큰 글자 (이모지 또는 단문자: `"♚"`, `"🎮"`, `"𝝅"`) |
| `cover.label` | string | — | 큰 텍스트 (예: `"205.kr"`) |
| `cover.badge` | string | — | 작은 라벨 (예: `"Unreal · 5인"`) |
| `cover.aspect` | enum | — | `1 / 4-5 / 3-4 / 4-3 / 16-9 / 16-10` |
| `cover.image` | image | — | 표지 이미지 (마크다운 같은 폴더에서) |
| `featured` | boolean | `false` | `true`면 큰 카드(`.feat`)로 표시 |

### 카테고리별 default 톤 (디자이너 시안 기준)
| 카테고리 | 권장 `cover.style` |
|----------|---------------------|
| game | `mood` (어두운 회색) |
| web | `mint` (시안색) |
| entry | `pink` (분홍) |
| contest | `cream` (베이지) |
| etc | `cream` |

### 상세 페이지 표현

| 필드 | 타입 | 설명 |
|------|------|------|
| `variant` | enum | `long / medium / short / empty` (지정 안 하면 자동) |
| `icon_emoji` | string | 페이지 헤더의 큰 이모지 |
| `result` | string | 수상 결과 (`"장려상"`, `"Rising Star Award · 퀄컴 장학팀"`) |
| `external_only` | boolean | `true`면 empty variant 강제 |

### 외부 링크

| 필드 | 설명 |
|------|------|
| `links.github` | GitHub 저장소 |
| `links.youtube` | 대표 영상 |
| `links.store` | Play 스토어 등 앱 스토어 |
| `links.site` | 사이트 URL |
| `links.notion` | 노션 원본 (마이그레이션 자동 추출) |
| `links.naver` | 네이버 (블로그·검색) |
| `links.yes24` / `links.kyobo` | 도서 판매처 |
| `links.others` | 기타 — `[{ label, url, kind }]` 형태. `kind: video / site / doc / other` |

### 정렬 / 가시성

| 필드 | 타입 | 설명 |
|------|------|------|
| `order` | number | 같은 카테고리 내 수동 정렬 |
| `draft` | boolean | `true`면 빌드 제외 (임시 숨김) |

---

## 4. 상세 페이지 variant 시스템

같은 페이지 골격(헤더 + 본문 + 푸터)에 4가지 변형이 있습니다. `src/lib/variant.ts`의 `resolveVariant()`가 자동 선택.

### 자동 판정 룰
1. frontmatter에 `variant:` 명시되어 있으면 그 값 사용
2. `external_only: true` → `empty`
3. 본문 80자 미만 → `empty`
4. H2가 3개 이상 → `long`
5. 본문 600자 미만 → `short`
6. 그 외 → `medium`

### 변형별 레이아웃

| Variant | 사용처 | 구조 |
|---------|--------|------|
| **long** | 게임 개발, 웹 개발 같은 회고록·트러블슈팅 | 좌측 mini-meta + 중앙 본문 + 우측 자동 TOC + 페이지 끝 prev/next |
| **medium** | 엔트리 활동, 짧은 회고 | 본문만 + 페이지 끝 prev/next (TOC 없음) |
| **short** | 공모전 수상 같은 한 줄 + 이미지 1장 | compact-card (큰 이모지 + 리본) + 본문 |
| **empty** | 외부 링크가 본체인 메모 | empty-state ("노션 원본에서 보기" 버튼) |

### variant 명시적 선택
자동 판정이 직관과 다를 때 frontmatter로 강제:
```yaml
variant: short   # 본문이 길어도 short로 표시
```

### 모든 항목의 variant 한꺼번에 보기 (감사 스크립트 권장)
필요하면 `scripts/audit-variants.mjs`를 만들어 모든 항목의 자동 판정 결과를 표로 출력. 직관에 안 맞는 항목만 frontmatter로 override하면 됩니다.

---

## 5. 본문 작성 가이드

본문은 일반 마크다운 + 약간의 위젯입니다.

### 5.1 헤딩

```md
## H2 제목     ← TOC에 자동 포함, long variant 판정에 영향
### H3 부제목  ← TOC에 들여쓰기로 포함
#### H4 이하   ← TOC에 표시되지 않음
```

H1은 frontmatter `title`이 자동으로 페이지 제목이 되므로 본문에서는 쓰지 않음.

### 5.2 이미지

```md
![설명 텍스트](image-1.png)
```

같은 폴더에 둔 이미지를 상대 경로로 참조. Astro가 자동으로 WebP 최적화.

**한글 파일명 주의**: 공백·괄호·특수문자가 있으면 깨질 수 있음. 가능하면 영문 + 하이픈으로 정규화 (`screenshot-1.png`).

### 5.3 영상

YouTube 영상은 frontmatter에 두는 게 깔끔함:
```yaml
links:
  youtube: "https://youtu.be/xxx"
  others:
    - label: "실행 영상"
      url: "https://youtu.be/yyy"
      kind: video
```

페이지 헤더의 `external-row` 버튼으로 자동 노출.

본문 중간에 영상을 넣고 싶으면 마크다운 링크 또는 인용 그대로:
```md
> 실행 영상: https://youtu.be/xxx
```

### 5.4 코드 블록

```md
```javascript
const x = 1;
```
```

신택스 하이라이팅은 Astro 기본 (Shiki + GitHub light). 언어 미지정 시 일반 텍스트.

긴 코드는 토글로 감쌀 수 있습니다 (HTML 직접):
```md
<details>
<summary>500줄짜리 함수 펼치기</summary>

```csharp
// 500 lines of code
```

</details>
```

### 5.5 콜아웃 (인용 블록)

```md
> 💡 처음 유니티 게임이라 시행착오가 많았다.
```

디자이너 시안의 `.callout` 스타일이 적용되도록 차후 컴포넌트 매핑 가능 (현재는 기본 `<blockquote>`로 렌더).

### 5.6 외부 링크

```md
[GitHub에서 보기](https://github.com/205sla/...)
```

### 5.7 표

```md
| 항목 | 값 |
|------|----|
| Cell | Cell |
```

---

## 6. 메인 페이지 정적 데이터 수정

콘텐츠 컬렉션과 별개로, 메인 페이지의 정적 텍스트는 `src/pages/index.astro`를 직접 편집합니다.

### 6.1 Hero 섹션 (`src/pages/index.astro` 상단)

| 변경하고 싶은 것 | 어디 |
|-------------------|------|
| 사이트 우상단 "현재 게임 개발 학습 중" | `<header class="nav">` 안의 `<div class="meta">` |
| "Last updated · 2026.04.28" | `<div class="left">`의 두 번째 `<span>` |
| 좌표 "37.59°N 127.06°E" | `<div class="right">` 안의 `<span>` |
| Hero 한 줄 소개 ("엔트리로 코딩에 입문해서…") | `<p class="lead">` 안의 텍스트 |
| 직책 "Author · Speaker · Developer" | `<div class="role">` |

### 6.2 Marquee (흐르는 띠)

`<div class="marquee-track">` 안의 두 `<span>` (같은 내용 두 번 반복). 항목을 추가/제거하려면 두 줄 모두 동일하게 수정.

### 6.3 Skills

`<section id="skills">`. 4단계 위계 (고수/중수/하수/응애)가 하드코딩. 새 언어/도구 추가 시 해당 단계의 `<div class="items">` 안에 `<span class="chip">…</span>` 추가.

"젓가락질" 이스터에그는 `id="secret-chip"`인 버튼으로 보존되어 있음.

### 6.4 Highlights (4 카드)

`<section id="highlights">` 안의 `<a class="highlight ...">` 4개. 각 카드에 `href`, `<h4>`, `<p>` 자유 편집.

### 6.5 Awards

`<section id="awards">` 안의 `<a class="award-row">` 7개. 새 수상 추가 시 같은 패턴으로 `<a>` 추가하고 적절한 `medal` 클래스(gold/silver/bronze) 부여.

### 6.6 Footer (메인)

`<footer class="foot" id="contact">`. 이메일·도메인·외부 채널·크레딧 4컬럼.

**중요**: 메인과 상세 페이지의 footer는 **분리**되어 있음. 상세 페이지 footer는 `src/layouts/project/ProjectBase.astro` 안.

### 6.7 외부 채널 (About 카드)

`<aside class="about-side">` 안의 `<div class="links-card">`. 새 채널 추가 시:
```html
<a class="link-row" href="https://...">
  <span class="left"><span class="ico">Tw</span>Twitter · @205</span>
  <span class="arrow">↗</span>
</a>
```

---

## 7. 디자인 수정

### 7.1 컬러·폰트·간격 토큰

`src/styles/tokens.css`. 모든 디자인 토큰이 CSS 변수로 정의됨:
- `--c205-mint`, `--c205-pink`: 브랜드 컬러
- `--bg-1` ~ `--bg-3`: 배경
- `--font-sans`, `--font-display`, `--font-hand`, `--font-num`: 폰트 패밀리
- `--space-1` ~ `--space-24`: 간격 (4px 베이스)
- `--radius-xs` ~ `--radius-full`: 모서리 라운딩

여기를 수정하면 사이트 전체에 즉시 반영.

### 7.2 메인 페이지 스타일

`src/styles/site.css`. Nav, Hero, About, Skills, Works, Highlights, Awards, Footer 별 스타일.

### 7.3 상세 페이지 스타일

`src/styles/project-detail.css`. ProjectHeader, layout (long/medium), compact-card, empty-state, related-nav 등.

### 7.4 새 cover 스타일 추가

현재 4종 (`mint/pink/mood/cream`). 새로 `gold` 추가 시:
1. `src/content.config.ts`의 `COVER_STYLE` enum에 `'gold'` 추가
2. `src/styles/site.css`에 `.cover-gold { background: ...; }` 추가
3. frontmatter에서 `cover.style: gold` 사용 가능

### 7.5 폰트 추가

`public/fonts/`에 OTF/WOFF 파일 둠. `src/styles/tokens.css`에서 `@font-face`로 등록:
```css
@font-face {
  font-family: "MyFont";
  src: url("/fonts/MyFont.otf") format("opentype");
  font-weight: 400;
  font-display: swap;
}
```

폰트 경로는 항상 `/fonts/...` (절대 경로) 사용 — public 디렉토리 매핑.

---

## 8. 빌드 / 배포

### 8.1 로컬 빌드

```bash
npm run build      # astro check (타입검사) + astro build
npm run preview    # 로컬 서버로 dist/ 결과 확인
```

`astro check`가 frontmatter zod 스키마 위반을 잡아냅니다. 위반 시 어느 파일·어느 필드가 문제인지 즉시 출력.

### 8.2 Cloudflare Pages 자동 배포

GitHub `main` 브랜치에 푸시하면 자동 빌드:
- preset: **Astro**
- build command: `npm run build`
- output directory: `dist`
- root directory: (비움 — 레포 루트)
- Node 버전: `NODE_VERSION=20` (환경변수)

PR마다 unique preview URL 생성 → 변경사항 미리 검증 가능.

### 8.3 커스텀 도메인

Cloudflare DNS에 Pages 라우팅:
- `205.kr` → 메인
- `이영호.com` (`xn--vj5bn0ab83a.com`) → 별칭

배포 setup은 한 번만 하면 됨 (Cloudflare Dashboard → Pages → Custom Domains).

### 8.4 빌드 실패 디버깅

| 증상 | 원인 / 해결 |
|------|-------------|
| `LegacyContentConfigError` | `src/content/config.ts` (구) → `src/content.config.ts` (신)로 이전 |
| `Invalid frontmatter` (zod) | 출력 메시지의 파일 경로 + 필드 확인. 필수 필드 누락? |
| 이미지가 빌드 결과에 안 보임 | 마크다운 폴더에 같이 두기. 절대 경로 (`/foo.png`) 사용 시 `public/`로 이동 필요 |
| `URL invalid` | `links.github` 등이 빈 문자열이면 안 됨. 누락이면 필드 자체를 제거 |
| 한글 슬러그 라우트 깨짐 | 영문 슬러그로 변경 또는 frontmatter `slug:` override |

---

## 9. 자주 발생하는 문제 (FAQ)

### Q. 새 마크다운을 만들었는데 dev 서버에서 카드가 안 보임
- `npm run dev`를 재시작 (Astro가 파일 추가는 hot reload, 새 폴더는 가끔 못 잡음)
- frontmatter `draft: true`가 박혀 있지 않은지 확인
- frontmatter `category` 값이 enum (`game/web/entry/contest/etc`) 안에 있는지

### Q. 빌드 시 zod validation error
- 메시지 형식: `Could not parse <filepath>: <field> is required`
- 자주 빠지는 필드: `title`, `category`, `description`
- 자주 잘못 입력: `category` 값을 한글로 (`게임`)이 아닌 `game`으로

### Q. 카드의 카운트가 갱신되지 않음
- 이건 **자동 계산**이라 수동 갱신 불필요. 만약 변하지 않으면 dev 서버 재시작 또는 빌드 캐시 클리어 (`rm -rf .astro dist`).

### Q. 한 카테고리만 표시하는 페이지가 필요해요
- 현재는 메인 페이지 필터 칩으로만 가능. 별도 라우트(`/projects/game/`)는 미구현.
- 만들고 싶으면 `src/pages/projects/[category]/index.astro` 동적 라우트 추가 → `getCollection`에서 카테고리 필터.

### Q. 외부 링크 버튼 순서를 바꾸고 싶어요
- 현재 `src/components/project/ProjectHeader.astro`가 `youtube → store → github → site → others` 순. 함수 안의 push 순서를 바꾸면 됨.

### Q. 노션 원본을 더 이상 동기화하지 않아도 되나요?
- 마이그레이션이 끝났으므로 더 이상 자동 동기화는 없음. 노션은 백업 / 메모 용도로 유지.
- 새로 작성한 콘텐츠는 노션 → 사이트가 아니라, **사이트(마크다운)가 정본**이고 노션은 보존용.

### Q. 디자이너 시안을 다시 보고 싶어요
- `_reference/portfolio.html`, `_reference/project-detail.html` (read-only 보존). 브라우저에서 file:// 로 직접 열기.

### Q. 사이트가 느려요
- 이미지가 webp로 자동 변환되지만 본문에 큰 PNG/JPG 다수면 빌드가 오래 걸릴 수 있음.
- 빌드 시간이 5분 넘으면 큰 이미지를 사전에 압축 (예: tinypng).

### Q. 다크 모드를 켜고 싶어요
- 디자이너 시안에 ◐ 아이콘만 있고 미구현. 구현 시 `BaseLayout.astro`에 클래스 토글 + tokens.css에 `[data-theme="dark"]` 셀렉터 + 컬러 변수 재정의.

---

## 10. 백업 / 복원 / 동기화

### 10.1 콘텐츠 백업

GitHub `main` 브랜치 자체가 1차 백업. private 레포라 안전.

### 10.2 노션 원본

`../{게임개발,웹사이트,엔트리,공모전,기타활동}/` 폴더에 마이그레이션 시점의 README.md들이 그대로 보존됨. 만약 새 사이트의 콘텐츠를 잃으면 이 백업에서 다시 마이그레이션 가능 (`scripts/migrate.mjs` 재실행).

**주의**: `migrate.mjs`를 다시 돌리면 `src/content/projects/`가 **덮어쓰기**됩니다. 그 사이 사용자가 수동으로 보정한 frontmatter도 같이 사라지므로, 마이그레이션은 정말 필요할 때만.

### 10.3 디자이너 시안 백업

`_reference/`에 보존. git 첫 커밋(547968d)에도 박제됨.

### 10.4 새 디자이너 시안 받았을 때

- `_reference/v2/` 같은 서브폴더에 추가 보관
- 변경된 부분만 `src/components/`, `src/layouts/`, `src/styles/`에 점진 반영

---

## 11. 파일 위치 빠른 참조

```
02. 사이트/
├── _reference/                       ← 디자이너 원본 (read-only)
│   ├── portfolio.html
│   ├── project-detail.html
│   ├── site.css
│   ├── project-detail.css
│   └── colors_and_type.css
├── public/
│   ├── assets/                        ← 디자이너 자산 (캐릭터 일러스트, 사진)
│   └── fonts/                         ← 5종 한글 OTF
├── scripts/
│   └── migrate.mjs                    ← 1회용 마이그레이션 (실행 완료)
├── src/
│   ├── components/
│   │   ├── ProjectCard.astro          ★ 갤러리 카드 모양
│   │   ├── WorksGallery.astro         ★ 갤러리 (자동 카운트)
│   │   └── project/
│   │       ├── ProjectHeader.astro    ★ 상세 페이지 헤더
│   │       └── RelatedNav.astro       ★ 페이지 끝 prev/next
│   ├── content/
│   │   └── projects/                  ★★★ 콘텐츠 (62개)
│   │       ├── game/<slug>/index.md
│   │       ├── web/<slug>/index.md
│   │       ├── entry/{사이트-내-성과,교육-성과,웹-개발}/<slug>/index.md
│   │       ├── contest/<slug>/index.md
│   │       └── etc/<slug>/index.md (+ highschool/<slug>/index.md)
│   ├── content.config.ts              ★★ zod 스키마 — 변경 시 모든 항목 영향
│   ├── layouts/
│   │   ├── BaseLayout.astro           ★ 메인 페이지 외곽
│   │   └── project/
│   │       ├── ProjectBase.astro      ★ 상세 페이지 외곽 (nav + footer)
│   │       ├── LongLayout.astro       ← long variant
│   │       ├── MediumLayout.astro     ← medium variant
│   │       ├── ShortLayout.astro      ← short variant
│   │       └── EmptyLayout.astro      ← empty variant
│   ├── lib/
│   │   ├── labels.ts                  ★ 카테고리 라벨 매핑
│   │   └── variant.ts                 ★ variant 자동 판정 + 정렬
│   ├── pages/
│   │   ├── index.astro                ★★★ 메인 페이지 (Hero, Skills 등 정적 데이터)
│   │   └── projects/
│   │       └── [...slug].astro        ★ 동적 라우트 (62 페이지 생성)
│   └── styles/
│       ├── tokens.css                 ★★ 디자인 토큰 + 폰트
│       ├── site.css                   ★ 메인 페이지 스타일
│       └── project-detail.css         ← 상세 페이지 스타일
├── astro.config.mjs                   ← Astro 설정 (sitemap, site URL)
├── package.json                       ← npm 의존성
├── tsconfig.json                      ← TypeScript strict + path alias (@/)
├── README.md                          ← 사이트 개요
└── MAINTENANCE.md                     ← 본 문서
```

★ = 일상적으로 자주 만지게 되는 파일.
★★ = 신중하게 변경 (전역 영향).
★★★ = 가장 자주 만지는 파일.

---

## 12. 응급 처치

### 사이트가 완전히 깨졌을 때

```bash
git log --oneline -10                       # 최근 커밋 확인
git revert <breaking-commit-sha>            # 안전한 되돌리기 (새 커밋 생성)
git push origin main                         # Cloudflare Pages 재배포
```

또는 직전 상태로 강제 복귀 (다른 사람과 협업 안 하므로 안전):
```bash
git reset --hard <last-good-commit>
git push --force-with-lease origin main      # 강제 푸시 — 신중하게
```

### node_modules가 꼬였을 때
```bash
rm -rf node_modules package-lock.json .astro dist
npm install
npm run build
```

### Astro 캐시 클리어
```bash
rm -rf .astro
npm run dev
```

---

## 13. 추가 작업 후보 (현재 미구현)

본인이 시간 날 때 직접 하거나 외주 의뢰 가능:
- [ ] 다크 모드 (디자이너 시안의 ◐ 버튼 동작)
- [ ] 카테고리별 인덱스 페이지 (`/projects/game/` 등)
- [ ] OG 이미지 자동 생성 (Satori + Astro endpoint)
- [ ] RSS 피드 (`@astrojs/rss`)
- [ ] 본문 콜아웃 / 코드 박스 디자이너 스타일 매핑 (현재 기본 마크다운 렌더)
- [ ] 검색 기능 (Pagefind 또는 Fuse.js)
- [ ] 분석 (Umami 또는 Cloudflare Web Analytics)
- [ ] PR 자동 시각 비교 (Playwright + 이미지 diff)

---

질문/추가 작업 요청은 노션 원본의 메모 페이지에 남기거나, GitHub Issues에 등록.

— 마지막 업데이트: 2026-05-02
