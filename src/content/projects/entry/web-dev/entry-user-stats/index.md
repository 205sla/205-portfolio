---
title: 엔트리 유저 통계 / 랭킹 (Ent2)
category: entry
subcategory: web-dev
cover:
  style: pink
links:
  github: https://github.com/205sla/entry-user-stats
  others:
    - label: 원작 Ent2ml
      url: https://github.com/gnlow/Ent2ml
      kind: other
description: 엔트리 프로필 URL로 유저 작품 통계를 보여주고, 검색된 유저들로 8개 부문 랭킹까지 제공하는 Next.js 15 웹앱 (Firestore 랭킹 · 무료 티어 운영).
---

엔트리([playentry.org](https://playentry.org)) 프로필 URL을 붙여넣으면 그 유저의 작품 통계를 보여주고, 검색된 유저들을 모아 부문별 **랭킹**까지 제공하는 Next.js 15 웹앱입니다. 원작 [gnlow/Ent2ml](https://github.com/gnlow/Ent2ml)을 참고해 Next.js로 다시 짰고, 여기에 통계 시각화와 Firestore 기반 랭킹을 더했습니다.

> 엔트리 공식 서비스가 아니며, 공개된 프로필 정보만 조회하는 비영리 · 개인 열람용입니다.

## 유저 통계

- 총 조회수 / 좋아요 / 댓글 / 사본 수 / 사용 블록 합계
- 작품 분류 분포(스태프 선정 · 인기 작품 · 겹침 · 일반), 카테고리별 작품 수
- 조회수 · 좋아요 기준 상위 10개 작품(썸네일 툴팁)
- 연도별 작품 제작 수, 가장 최근 수정 작품과 활동 일자(상대 시간)
- 가입일 기준 총 활동 기간

차트는 Recharts로 그립니다 — 파이(분류 분포) · 막대(연도별) · 상위 작품 등.

## 랭킹 (8개 부문)

총 조회수 / 좋아요 / 댓글 / 사본 / 사용 블록 / 총 활동 기간 / 총 인기 작품 수 / 스태프 선정 작품 수.

검색된 유저가 자동으로 랭킹에 쌓이는 구조여서, 따로 수집기를 돌리지 않아도 사용자가 곧 데이터 소스가 됩니다.

```
[사용자가 /u/{id} 검색]
        ↓
  통계 집계 → 페이지 응답 먼저 전송
        ↓
  after(() => recordRanking(stats))   ← 응답 후 백그라운드 Firestore 쓰기
                                        (같은 유저 1시간 이내 재기록 skip)
```

- 응답을 막지 않으려고 랭킹 기록을 Next.js 15의 `after()`로 **응답 이후 백그라운드**에 미룹니다.
- 랭킹 페이지는 **60초 ISR** 캐시로 재방문 시 Firestore read를 아낍니다.
- 활동 기간 외 7개 부문은 작품 300개 초과(부분 집계) 유저를 제외합니다.

## 주요 경로

- `/` — 홈 (프로필 URL 입력)
- `/ranking` — 랭킹 페이지 (탭으로 부문 전환, ISR 60초)
- `/ranking?type=likes` — 부문 직접 지정 (`views`·`likes`·`comments`·`clones`·`blocks`·`activity`·`popular`·`staff`)
- `/u/[id]` — 통계 페이지 (SSR)
- `/api/stats?id=...` — JSON API

## 내부 구조

- **통계**: `app/u/[id]/page.tsx`(SSR 렌더) · `app/api/stats/route.ts`(JSON API) · `lib/stats-service.ts`(페이지·API 공통 조회 + 캐시 + 백그라운드 랭킹 기록)
- **엔트리 연동**: `lib/entry-api.ts`(엔트리 GraphQL 클라이언트, CSRF 세션 캐시) · `lib/aggregate.ts`(작품 리스트 → 통계 집계) · `lib/extract-id.ts`(URL → 유저 ID)
- **캐시 · 제한**: `lib/cache.ts`(in-memory TTL — stats 30분 / CSRF 토큰 10분) · `lib/rate-limit.ts`(IP당 분당 3회 fixed-window)
- **랭킹**: `lib/firebase.ts`(Firebase Admin SDK 싱글톤, lazy 초기화) · `lib/ranking.ts`(`recordRanking` / `getRanking`) · `firestore.indexes.json`(composite 인덱스)
- **UI**: `StatsView` · `StatCards` · `FlagsPieChart` · `CategoryChart` · `TopProjectsChart` · `YearBarChart` · `UrlForm` · `RankingTable`

## 무료 티어 안에서 운영

Firestore Spark(무료) 한도 안에 들어오도록 설계했습니다. `after()` 백그라운드 쓰기, 1시간 dedupe, 60초 ISR로 read/write를 줄였습니다.

| 지표 | 무료 한도 | 예상 사용(검색 100/일 + 랭킹뷰 50/일) |
|---|---|---|
| Reads/일 | 50,000 | ~1,500 (3%) |
| Writes/일 | 20,000 | ~100 (0.5%) |
| Storage | 1 GiB | 5만 유저 ≈ 12 MB (1%) |

트래픽이 30배 늘어도 무료 한도 안에서 버틸 만한 여유입니다.

## 제한 사항 (의도된 트레이드오프)

- 엔트리 API 부담을 줄이려 작품 페이지네이션을 **최대 6회(=300개)** 로 제한합니다. 300개를 넘는 유저는 헤더 · 총 작품 수 · 활동 기간 · 최근 작품만 보여주고 상세 집계는 생략하며(`truncated`), 활동 기간 외 랭킹에서는 제외합니다.
- 엔트리 GraphQL은 공식 공개 API가 아니라 스키마 · 인증이 언제든 바뀔 수 있습니다.
- Vercel Hobby 함수 타임아웃(10초) 안에 응답해야 합니다.
- 캐시 · 레이트리밋은 인스턴스 메모리 기반이라 인스턴스끼리 공유되지 않습니다(랭킹 저장소만 영구).

## 프라이버시

- `/u/{id}` 검색 시 통계가 자동으로 랭킹에 등록되며, 홈과 `/ranking`에 그 안내를 표시합니다.
- `/u/{id}`는 `robots.txt`에서 disallow로 검색엔진 인덱싱을 막고, 공개가 목적인 `/ranking`만 인덱싱을 허용합니다.

## 기술 스택

`Next.js 15 (App Router · SSR · ISR · after())` · `React 19` · `TypeScript` · `Tailwind CSS` · `Recharts` · `Firebase Admin SDK (Firestore)`
