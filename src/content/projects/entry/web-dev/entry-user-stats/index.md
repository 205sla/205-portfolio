---
title: 엔트리 유저 통계 / 랭킹 (Ent2)
category: entry
subcategory: web-dev
cover:
  style: pink
links:
  github: https://github.com/205sla/entry-user-stats
description: 엔트리([playentry.org](https://playentry.org)) 프로필 URL을 붙여넣으면 해당 유저의 작품 통계를 보여주고, 검색된 유저들로 부문별 **랭킹**을 제공하는 Next.js 15 웹앱입니다.
---

엔트리([playentry.org](https://playentry.org)) 프로필 URL을 붙여넣으면 해당 유저의 작품 통계를 보여주고, 검색된 유저들로 부문별 **랭킹**을 제공하는 Next.js 15 웹앱입니다.

## 기능

### 유저 통계

- 총 조회수 / 좋아요 / 댓글 / 사본 수 / 사용 블록 합계
- 작품 분류 분포 (스태프 선정 · 인기 작품 · 겹침 · 일반)
- 카테고리별 작품 수 및 집계
- 조회수 · 좋아요 기준 상위 10개 작품 (썸네일 툴팁)
- 연도별 작품 제작 수
- 가장 최근 수정한 작품 + 활동 일자 (상대 시간)
- 가입일 기준 총 활동 기간

### 랭킹 (8개 부문)

총 조회수 / 좋아요 / 댓글 / 사본 / 사용 블록 / 총 활동 기간 / 총 인기 작품 수 / 스태프 선정 작품 수.

사용자가 `/u/{id}`로 검색하면 해당 유저의 통계가 자동으로 Firestore에 등록(1시간 dedupe). 활동 기간 외 7개 부문은 작품 300개 초과 유저(부분 집계)는 제외합니다.

## 주요 경로

- `/` — 홈 (프로필 URL 입력)
- `/ranking` — 랭킹 페이지 (탭으로 부문 전환, ISR 60초)
- `/ranking?type=likes` — 부문 직접 지정 (`views`·`likes`·`comments`·`clones`·`blocks`·`activity`·`popular`·`staff`)
- `/u/[id]` — 통계 페이지 (SSR)
- `/api/stats?id=...` — JSON API

## 내부 구조 (요약)

- `lib/entry-api.ts` — 엔트리 GraphQL 클라이언트 (CSRF 세션 캐시 포함)
- `lib/aggregate.ts` — 작품 리스트 → 통계 집계
- `lib/cache.ts` — in-memory TTL 캐시 (stats 30분 / CSRF 토큰 10분)
- `lib/firebase.ts` — Firebase Admin SDK 싱글톤 (lazy 초기화)
- `lib/ranking.ts` — `recordRanking(stats)` / `getRanking(type, limit)`
- `lib/rate-limit.ts` — IP당 분당 3회 fixed-window 제한 (best-effort)

