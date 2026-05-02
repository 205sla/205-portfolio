---
title: 205 엔트리 도구 모음 사이트
category: entry
subcategory: web-dev
cover:
  style: pink
links:
  github: https://github.com/205sla/entry-tools-site
description: 205(이영호)가 만든 엔트리 관련 확장프로그램·웹 서비스·도서·커뮤니티를 한 페이지에 모아 소개하는 React 기반 단일 페이지입니다. 10년 넘게 엔트리를 써 오며 필요해서 하나씩 만든 도구들을 한데 모은 **소개 페이지**입니다 (도구 자체의 구현체가 아니라 카탈로그).
---

205(이영호)가 만든 엔트리 관련 확장프로그램·웹 서비스·도서·커뮤니티를 한 페이지에 모아 소개하는 React 기반 단일 페이지입니다. 10년 넘게 엔트리를 써 오며 필요해서 하나씩 만든 도구들을 한데 모은 **소개 페이지**입니다 (도구 자체의 구현체가 아니라 카탈로그).

## 페이지 구성

| 섹션 | 내용 |
|---|---|
| **Hero** | 타이포·통계(4 웹 서비스 / 3 크롬 확장 / 2 출간 도서 / 10y 활동), 작품 카드 모티프 |
| **01 · Books** | 다락원 《원큐패스 나는야 엔트리 게임 개발자》, 《나는야 엔트리 화가》 |
| **02 · Extensions** | EntryMerge 작품 합치기 · 엔트리 디버깅 툴 · Entry Save Manager |
| **03 · Web Services** | entry.205.kr · code.205.kr · 짧은 엔트리(엔트리.org) · 유저 찾기 |
| **04 · Collaboration** | 엔트리 넥스트 챌린지 제작자 참여, EDC 2023 발표 |
| **05 · Channels** | YouTube "205와 엔트리" · Discord "엔트리 유튜버들" · 엔트리 밴드 |
| **About / Footer** | 제작자 소개 + 전체 링크 인덱스 |

## 기술 특이점 — 빌드 없이 돌아가는 구조

- **React 18** (UMD from unpkg)
- **@babel/standalone** — 브라우저에서 JSX를 런타임 컴파일
- 정적 HTML/CSS — 번들러·npm·node 없음
- Pretendard Variable + JetBrains Mono + Space Grotesk — 타이포그래피
- CSS Custom Properties로 3개 테마(light / dark / studio)
- GitHub Pages + Let's Encrypt 자동 HTTPS

각 `.jsx` 컴포넌트는 `<script type="text/babel">`로 로드되고, `Object.assign(window, { ... })`로 전역에 자신을 등록해서 다른 컴포넌트가 참조합니다. 모듈 시스템은 일부러 쓰지 않았습니다.

## 디자인 모티프

엔트리의 블록 코딩 모양을 암시하는 **블록 모티프 프리미티브** (`components/Blocks.jsx`의 `BlockShape` / `BlockStack` / `SocketBadge`)를 카드·섹션에 사용. 엔트리 브랜드 그린(`#1fb25a`) 기반 + 보조 오렌지·퍼플·네이비 카테고리 팔레트.

`components/Tweaks.jsx`는 외부 호스트에서 `postMessage`로 편집 모드를 열면 테마·히어로·밀도·블록 모티프를 즉석에서 바꿀 수 있는 **런타임 디자인 튜닝 패널**입니다.

