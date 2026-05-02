---
title: 엔트리 vibe-coding — `.ent` 작품 자동 생성 파이프라인
category: entry
subcategory: web-dev
cover:
  style: pink
links:
  github: https://github.com/205sla/entry-vibe-coding
description: "\"○○ 게임 만들어줘\" 같은 자연어 요청이 들어오면 **엔트리 편집기에서 바로 실행되는 `.ent` 파일**을 자동 생성하는 파이프라인입니다."
---

"○○ 게임 만들어줘" 같은 자연어 요청이 들어오면 **엔트리 편집기에서 바로 실행되는 `.ent` 파일**을 자동 생성하는 파이프라인입니다.

> 자연어 요청 → JSON spec → `.ent` (tar.gz) → 편집기에서 로드·실행

## 구성요소

| 구성요소 | 역할 |
|---|---|
| `tools/make-ent.mjs` | **핵심 생성기** — JSON spec을 받아 `.ent` 파일을 생성 |
| `tools/block-registry.json` | 274개 엔트리 블록의 type·params·statements 메타데이터 (AST 추출) |
| `public/` | 오프라인 엔트리 편집기 — 생성된 `.ent`를 로드·수정·저장 |
| `server.js` | 편집기 백엔드 (`/api/load`, `/api/export`, `/api/ent-asset/:sid/*`) |
| `knowledge/` | `.ent` 포맷·블록·편집기 관련 시행착오 지식(위키) |
| `tests/fixtures/spec-*.json` | 예시 spec (empty ~ memory-ranking) |
| `tests/smoke.test.js` + `tests/e2e.spec.js` | 각 `.ent`가 구조적으로·런타임에 정상 동작하는지 검증 |

## 파이프라인

```
자연어 요청 → ① 게임 설계 (Claude 작업, knowledge/ 참조)
           → ② spec JSON 작성 (tests/fixtures/spec-<name>.json)
           → ③ make-ent.mjs 실행 (이미지 rasterize → PNG 번들 → tar(ustar) + gzip)
           → ④ 검증 (smoke: tar 파싱 / 필수 키 / 블록 type;
                       e2e: 실제 편집기에 로드 → 경고 블록 없는지)
           → 사용자에게 .ent 파일 경로 + 설명 전달
```

## 게임 설계 패턴 (Claude가 하는 판단)

- **싱글 플레이어**: 1 오브젝트 (예: `follow-mouse`, `random-walk`)
- **플레이어 + 적**: 2 오브젝트 (예: `chase`, `chase-hp`)
- **플레이어 + 생성되는 장애물**: 원본 + 클론 (`create_clone("self")` + `when_clone_start`)
- **진행자 + 키 입력**: 1 오브젝트 + 여러 thread (예: `memory-pattern`, `memory-ranking`)

## 지식 문서 (knowledge/)

| 단계 | 참고 |
|---|---|
| ① 설계 | `04-script-and-blocks.md` 카테고리별 블록·params, `06-gotchas.md` 함정 회피 |
| ② spec 작성 | `02-project-json.md` 최상위 스키마, `03-objects-and-assets.md` Object/Picture 필드 |
| ③ 생성 | `tools/make-ent.mjs`가 `01-binary-format.md`의 tar 포맷을 실현 |
| ④ 검증 | 실패 시 `06-gotchas.md`에서 증상으로 검색 |

