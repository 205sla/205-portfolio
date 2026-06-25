---
title: 엔트리 디버깅 툴 (Entry-Debugger) — 크롬 확장
category: entry
subcategory: web-dev
cover:
  style: pink
  image: ./화면.png
links:
  github: https://github.com/205sla/Entry-Debugger
  others:
    - label: 크롬 웹스토어
      url: https://chromewebstore.google.com/detail/meginahneajajhniecgebilpldnabkob
      kind: site
description: 엔트리 작품 편집기에서 변수·리스트·신호·장면을 실시간 모니터링·제어하고, 모양 도구·함수 보관함 등 제작 편의 기능까지 더한 크롬 확장(MV3, v2.6.1).
---

엔트리(Entry) 작품 편집기에서 **변수 · 리스트 · 신호 · 장면**을 실시간으로 모니터링하고 직접 제어하는 크롬 확장입니다. 확장 아이콘으로 디버거를 켜면 편집기 우측에 **[디버깅] 탭**이 생깁니다.

- **대상 페이지**: `https://playentry.org/ws/*` (작품 편집기)

![엔트리 디버깅 툴 화면](화면.png)

## 디버깅 패널 — 4개 카테고리

- **변수**: 전역·지역 변수 값을 200ms 주기로 실시간 표시. 값을 클릭하면 입력창으로 바뀝니다. 여기서 고친 값은 작품 실행 중에도 즉시 반영됩니다. 15자가 넘는 값은 줄여 표시하고 마우스를 올리면 전체값을 툴팁으로 보여줍니다.
- **리스트**: 헤더를 펼쳐 모든 항목을 한눈에 보고, 항목별 수정·삭제 + 새 항목 추가.
- **신호**: 등록된 신호 목록과 "신호 보내기"로 강제 발생(`entry.engine.raiseMessage`) → "신호를 받았을 때" 블록을 즉시 트리거.
- **장면**: 장면 목록과 "이동"으로 전환 + (실행 중이면) "장면이 시작되었을 때" 이벤트 자동 발화.

## 편집기 편의 기능

디버깅 외에도 작품 제작을 돕는 기능을 설정/실험실 토글로 제공합니다.

- **모양 탭 편의 기능** — 여러 모양을 다중 선택(클릭/Shift/Ctrl)해 묶음 드래그로 재정렬하거나 다른 오브젝트로 복사. 우클릭 메뉴로 복사·붙여넣기(오브젝트 간)·복제·일괄 삭제·ZIP/이미지 내보내기·일괄 이름변경. 이미지·GIF(PNG 프레임 분해)를 10개씩 누적해 대량 업로드. 모양이 많아도 끊기지 않도록 재정렬·삭제를 증분 DOM으로 최적화했습니다.
- **함수 보관함** — 자주 쓰는 함수 템플릿을 추가합니다(예: 숫자를 한글로 읽는 `numberToHangul` 값 함수). 추가 시 함수·블록·지역변수·동적 파라미터 ID를 안전하게 재생성합니다.
- **초고화질 블록 이미지 저장** — 블록/전체 코드 우클릭 저장에 200~2000% 배율 적용.
- **Alt 단일 블록 드래그** — 연결된 블록 묶음에서 `Alt`를 누른 채 선택한 블록만 분리해 이동.
- 그 밖에 부스트 모드, 속성 검색으로 찾기 등.

## 구조 · 동작

```
entry-debugger-extension/
├── manifest.json   Manifest V3
├── popup.*         확장 아이콘 팝업 (활성화 토글)
├── background.js   서비스 워커 (메시지 라우팅)
├── content.js      디버거 패널 UI (Isolated world)
└── inject.js       Entry API 직접 제어 (Main world)
```

- `content.js` ↔ `inject.js`는 `window.postMessage`(채널 `__ENTRY_DEBUGGER__`)로 통신하고, **200ms 폴링으로 스냅샷 변경분만** 브로드캐스트해 비용을 줄입니다.
- 배포본은 `https://playentry.org/ws/*`에서만 동작합니다. 로컬 Entry 서버용 개발 빌드는 따로 분리해 두었습니다.
- 검증은 정적 검사(`check`)와 Chromium 기반 스모크(`smoke:local`, 모양 도구 `smoke:picture-tools`)로 합니다.

## 기술 스택

`Chrome Extension (Manifest V3)` · `Vanilla JS` · `MAIN / Isolated world 분리 + postMessage` · `Chromium 스모크 테스트`
