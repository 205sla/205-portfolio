---
title: 엔트리 vibe-coding — `.ent` 작품 자동 생성 파이프라인
category: entry
subcategory: web-dev
cover:
  style: pink
links:
  github: https://github.com/205sla/entry-vibe-coding
description: "\"○○ 게임 만들어줘\" 자연어 요청을 받아 엔트리에서 바로 실행되는 .ent 게임을 자동 생성하는 파이프라인 — 자체 DSL · 274블록 레지스트리 · 5단계 검증."
---

"○○ 게임 만들어줘" 같은 자연어 요청을 받으면 **엔트리 편집기에서 바로 실행되는 `.ent` 파일**을 자동으로 만들어 냅니다. AI(Claude)가 게임을 설계하면 이 저장소의 DSL · 블록 레지스트리 · 다층 검증이 **실제로 동작하는 작품**이 나올 때까지 떠받칩니다.

> 자연어 요청 → DSL `.mjs`(또는 JSON) spec → `.ent`(tar.gz) → 편집기에서 로드·실행

## 파이프라인

```
자연어 요청
  → ① 게임 설계 (오브젝트·변수·thread 구조 결정, knowledge/ 패턴 참조)
  → ② spec 작성 (DSL .mjs 우선, JSON도 가능)
  → ③ --check 정적 검증 (< 1초: 블록 type·params·슬롯)
  → ④ make-ent 빌드 (이미지 rasterize·해시 dedup → tar(ustar)+gzip)
  → ⑤ 다층 검증 (스모크 → e2e → 런타임 플레이)
  → 사용자에게 .ent 파일 + 설명 전달
```

빠른 `--check`(1초)와 느린 런타임 검증을 분리한 덕분에, **AI가 스스로 고쳐 가며 수렴하는 루프**가 만들어집니다. 이게 핵심입니다.

## 자체 DSL — spec을 코드로

초기에는 JSON으로 spec을 직접 썼습니다. 그런데 8단 중첩과 슬롯 래핑이 워낙 많아 `tools/lib/spec-dsl.mjs`라는 **fluent DSL**을 따로 만들었습니다.

- `setVar` · `when.run` · `obj` · `if_` · `repeat` · `cmp` 같은 헬퍼로 작성하면 paramCount·슬롯 wrap을 자동 처리하고 IDE 자동완성이 붙습니다.
- 같은 게임을 약 **5배 짧게** 표현합니다(피보나치 기준 163줄 → 76줄).
- `tools/lib/sprite-gen.mjs`로 `circle` · `ring` · `star` · `heart` 같은 **inline SVG 그래픽**을, `tools/lib/game-assets.mjs`로 이름 붙인 자산을 콘텐츠 해시 dedup과 함께 생성합니다.

## 오프라인 엔트리 편집기 — 엔진 순정 그대로

생성한 `.ent`를 눈으로 확인하고 헤드리스로 검증하려면 엔트리 "만들기" 편집기가 필요합니다. 이걸 **로컬에서 통째로 띄웁니다.**

- 엔트리 엔진([entrylabs/entryjs](https://github.com/entrylabs/entryjs))은 **순정 그대로** 씁니다 — 공식 npm 아티팩트(`@entrylabs/entry`) prebuilt dist를 드롭인하며 **엔진 소스 패치는 0**입니다.
- 오프라인 부팅 · `.ent` 로드 · 헤드리스 테스트에 필요한 적응은 전부 **호스트 레이어**(`editor.js` · `server.js` · `setup.mjs`)에만 둬서, 엔진 버전이 올라가도 두 지점(부팅 · 로드)만 맞추면 됩니다.
- `npm run setup` 한 번이면 엔진 dist · 외부 모듈 · vendor를 자동 구성합니다(빌드 없이 prebuilt만, 재실행 안전).

## 274개 블록 레지스트리

`tools/block-registry.json`에 엔트리 블록 **274종**의 type · params · statements 메타데이터를 담았습니다. entryjs 소스를 **AST로 자동 추출**(acorn)해 만들었고, 이 레지스트리가 `--check` 정적 검증의 근거가 됩니다 — 존재하지 않는 블록이나 잘못된 인자 개수를 빌드 전에 1초 안에 잡아냅니다.

## 5단계 검증

빠른 것부터 느린 것 순으로 쌓아서 LLM 자기 수정 루프의 신뢰도를 받칩니다.

| 단계 | 내용 | 시간 |
|---|---|---|
| ① `--check` | 블록 type · paramCount · 슬롯 wrap 정적 검사 | < 1초 |
| ② smoke | 23개 fixture의 tar/JSON 파싱 · 블록 type · 자산 일치 | ~5초 |
| ③ e2e (Playwright) | 편집기 부트 + 모든 fixture 로드 시 콘솔 에러 0 · 경고 블록 0 | ~30초 |
| ④ runtime (Playwright+Chromium) | **실제 게임 플레이** — 변수 변화 · 클론 수 · 픽셀 색 · 클릭 hit-test · 좌표 변환 | ~4분 |
| ⑤ links | knowledge 문서 간 300+ 교차링크 무결성 | < 1초 |

특히 ④는 14개 검증 스크립트가 헤드리스 크로뮴으로 게임을 실제로 조작해(키 입력 · 마우스 클릭) 의도대로 동작하는지까지 확인합니다.

## 지식 위키 (knowledge/)

`.ent` 바이너리 포맷 · project JSON 스키마 · 런타임 함정 · 디자인 패턴을 13개 문서로 정리한 정본 위키입니다. 디자인 패턴 25종 이상(클론 슬롯, direction-as-id, brush 빔 시각화 등)과 엔진 런타임 함정(60fps 틱, 메시지 fan-out, 좌표 변환 등)을 모았고, 과거에 해결한 버그는 `lessons.md`에 한 줄 회귀 가드로 남깁니다.

## 만들 수 있는 게임

`tests/fixtures/`에 21개 spec · 23개 fixture가 있고, 복합 게임은 가장 비슷한 것을 복제해 시작합니다.

- 키보드 조작 · 마우스 추적 · 체력/점수 · 장애물 피하기(클론)
- 3장면 게임(메뉴 → 플레이 → 결과), 사용자 정의 함수, 닉네임 입력 + 공유(클라우드) 리스트 랭킹
- Breakout(패들·공·벽돌 클론), 3×3 클론 격자 정답 판정
- **타워 디펜스**(`spec-frontier-guard.mjs`) — 빌드 슬롯 · 골드 경제 · 업그레이드 · 다중 웨이브 · 공격 시각화까지 종합한 reference

생성된 `.ent`는 이미지 · 사운드를 tar 내부에 번들한 **자가완결** 파일입니다. 그래서 playentry.org를 포함한 어떤 엔트리 편집기로 가져가도 그대로 동작합니다.

## 기술 스택

`Node.js` · `Express` · `자체 DSL (.mjs)` · `sharp (이미지 rasterize)` · `acorn (블록 AST 추출)` · `puid · uid (자산 해시)` · `Playwright + Chromium (런타임 검증)` · `오프라인 entryjs 편집기`
