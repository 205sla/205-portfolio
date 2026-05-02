---
title: SOW Grid Editor — 타워 디펜스 맵 에디터
category: game
cover:
  style: mood
links:
  github: https://github.com/205sla/SOW-Grid-Editor
description: 타워 디펜스 게임 맵을 생성하고 관리하기 위한 **단일 파일 HTML 그리드 에디터**입니다. `.ini` 형식의 맵 파일과 함께 작동하도록 설계되었습니다.
---

타워 디펜스 게임 맵을 생성하고 관리하기 위한 **단일 파일 HTML 그리드 에디터**입니다. `.ini` 형식의 맵 파일과 함께 작동하도록 설계되었습니다.

## 주요 기능

- **시각적 그리드 에디터**: 실시간 미리보기 + 드래그 앤 페인트 방식
- **타일 유형**: PATH, SPAWN, RUNE, BLOCKED 및 BLOCKED 변형(L1–L5) (선택적 modifier 포함)
- **자동 경로 생성**: 길찾기 알고리즘으로 SPAWN → RUNE 적 경로 자동 생성
- **이중 경로 시스템**: 일반 경로 + BLOCKED 지형을 통과할 수 있는 modifier 경로(`_M` 접미사)
- **맵 관리자**: 브라우저 localStorage에 맵 최대 50개 저장/불러오기
- **파일 입출력**:
  - `.ini` 형식 내보내기 (원본 게임 포맷과 호환)
  - `.ini` 가져오기·일괄 가져오기
  - 모든 맵을 `.ini` 또는 `.json`으로 일괄 내보내기
- **설정 유지**: ClassMap·Meta 설정이 쿠키에 저장
- **한국어 UI** (기술 용어는 영어 유지)
- **경로 시각화**: 생성된 경로를 색상으로 구분하여 오버레이 표시

## 빠른 시작

1. 웹 브라우저에서 `grid-editor.html`을 엽니다.
2. 새 맵을 만들거나 기존 `.ini` 파일을 불러옵니다.
3. 타일 팔레트로 그리드에 색칠하듯 타일 배치.
4. 그리드 크기(가로 × 세로) 설정.
5. 경로를 자동 또는 수동으로 생성.
6. localStorage에 저장하거나 `.ini`/`.json` 파일로 내보내기.

## `.ini` 포맷 구조 (요약)

```ini
[Meta]
GridWidth=19
GridHeight=10
TileWidth=300
TileHeight=300
Default=BLOCKED

[ClassMap]
TURRET1=/Game/01Blueprints/Tile/Tiles/BP_Tile_Turret_Forest_Stone1...
PATH=/Game/01Blueprints/Tile/Tiles/BP_Tile_Path_Default...
BLOCKED=/Game/01Blueprints/Tile/Tiles/BP_Tile_Blocked_Default...
SPAWN1=/Game/01Blueprints/Tile/Tiles/BP_Tile_EnemySpawner...
RUNE=/Game/01Blueprints/Tile/Tiles/BP_Tile_CoreRune...

[Grid]
Row0=BLOCKED,BLOCKED,BLOCKED,...
```

