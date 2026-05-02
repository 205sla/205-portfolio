---
title: 엔트리 디버거 (Entry-Debugger) — 크롬 확장
category: entry
subcategory: web-dev
cover:
  style: pink
  image: ./화면.png
links:
  github: https://github.com/205sla/Entry-Debugger
description: 엔트리(Entry) 코딩 플랫폼에서 **변수와 리스트를 실시간으로 모니터링·수정**할 수 있는 크롬 확장프로그램입니다.
---

엔트리(Entry) 코딩 플랫폼에서 **변수와 리스트를 실시간으로 모니터링·수정**할 수 있는 크롬 확장프로그램입니다.

- **대상 페이지**: `https://playentry.org/ws/*` (작품 편집기 화면)

## 주요 기능

- 작품 실행 중 변수·리스트 값을 실시간으로 표시
- 값을 직접 수정해 동작 확인
- 엔트리 작품 디버깅·테스트 자동화에 활용

![Entry-Debugger 화면](화면.png)

## 구조

- `manifest.json` — Manifest V3
- `content.js` / `inject.js` — 작품 페이지에 디버거 주입
- `popup.html` / `popup.js` — 확장프로그램 팝업 UI
- `background.js` — 서비스 워커
