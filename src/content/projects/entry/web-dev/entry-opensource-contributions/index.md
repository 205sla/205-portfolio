---
title: 엔트리 오픈소스 기여 (entryjs · entry-tool)
category: entry
subcategory: web-dev
cover:
  style: pink
links:
  youtube: https://youtu.be/p_tc8PTfUHc
  others:
    - label: entry-tool PR #469
      url: https://github.com/entrylabs/entry-tool/pull/469
      kind: other
    - label: entryjs 포크
      url: https://github.com/205sla/entryjs
      kind: other
    - label: entry-tool 포크
      url: https://github.com/205sla/entry-tool
      kind: other
description: 엔트리 오픈소스 코어 entryjs · entry-tool에 버그를 직접 추적·수정해 올린 PR 기여 내역 (entry-tool #469 등).
---

엔트리(playentry.org)의 오픈소스 코어인 **entryjs**와 **entry-tool**에서 버그를 직접 추적해 수정하고 공식 저장소에 PR로 기여한 내역입니다. 버그 제보에서 그치지 않고 원인을 코드 레벨까지 짚은 다음, 최소 침습으로 고치고 검증(정적 검사·테스트·빌드·브라우저 자동화·영상)을 마친 뒤 올렸습니다.

| 기여 | 대상 | 상태 |
|---|---|---|
| Sortable 드래그-중-스크롤 좌표 수정 | entry-tool [#469](https://github.com/entrylabs/entry-tool/pull/469) | PR 제출 |
| 블록 메뉴 `Ctrl+1`~`Ctrl+9` 단축키 인덱스 수정 | entryjs [#3074](https://github.com/entrylabs/entryjs/pull/3074) | PR 제출 |
| 속성 사용처 패널 미갱신 · 메모리 누수 수정 | entryjs [#3076](https://github.com/entrylabs/entryjs/pull/3076) | PR 제출 |

## 1. entry-tool #469 — Sortable 드래그 중 스크롤 좌표 수정 (PR 제출)

모양 · 소리 · 장면 목록을 **정렬하려고 드래그하는 도중에 스크롤하면 드롭 위치가 포인터와 어긋나던** 버그를 수정했습니다.

- **원인**: `SortableList`가 `react-sortable-hoc`에 `getContainer`를 넘기지 않아 내부 목록 요소를 스크롤 컨테이너로 잘못 잡았습니다. 정작 스크롤되는 요소는 `react-custom-scroll`이 만든 상위 `.rcs-inner-container`였고, 그 `scrollTop` 변화가 드롭 인덱스 계산에 반영되지 않았습니다.
- **수정**: 실제 스크롤 컨테이너(`.rcs-inner-container`)를 `getContainer`로 반환하고, 초기 마운트 때 루트 ref가 준비되기 전의 경합은 `Promise`로 흡수했습니다 (`react-sortable-hoc@0.8.4`가 `getContainer` 결과를 `Promise.resolve()`로 처리). 손댄 파일은 `src/components/widget/sortable.jsx` 하나입니다.
- **리뷰 대응**: 제출 후 Copilot이 "`Element.closest`는 IE11에서 미지원인데 `babel.config.js` 타깃에 `ie >= 11`이 있다"고 지적했습니다. `matches` · `msMatchesSelector` 등으로 부모를 거슬러 찾는 폴백 헬퍼로 바꿔 호환성을 맞췄습니다(커밋 `210bb38`).
- **검증**: `build:prod`를 통과했고, 브라우저 자동화로 `scrollTop`이 변하는(610↔915) 중에도 포인터 · emit `newIndex` · 모델 · DOM 인덱스가 일치함을 확인했습니다. 마우스 · 터치 경로도 모두 점검했습니다.
- **링크**: PR <https://github.com/entrylabs/entry-tool/pull/469> · 데모 영상 <https://youtu.be/p_tc8PTfUHc>

## 2. entryjs — 블록 메뉴 `Ctrl+1`~`Ctrl+9` 단축키 인덱스 수정 (PR 제출)

만들기 화면에서 `Ctrl+1`~`Ctrl+9`로 블록 카테고리가 선택되지 않던 버그를 수정했습니다.

- **원인**: `_captureKeyEvent`가 키 코드(`49`~`57`)를 그대로 `_dSelectMenu()`에 넘겼는데, `selectMenu`의 숫자 selector는 "보이는 카테고리의 0-기반 인덱스"로 해석됩니다. 그러다 보니 카테고리 범위를 벗어나 아무것도 선택되지 않았습니다.
- **수정**: `keyCode - 49`로 변환해 `Ctrl+1` → `0` … `Ctrl+9` → `8`로 매핑했습니다. 바뀐 곳은 `src/playground/block_menu.ts` 한 파일(+2/−1)뿐입니다.
- **검증**: `corepack pnpm@9.15.9`로 `test` · `dist`를 통과했고, 로컬 8080 만들기 화면에서 `Ctrl+2`를 입력하면 카테고리가 `시작`→`흐름`으로 전환되는 것을 확인했습니다.
- **참고**: 기존 핸들러 구조는 그대로 두고 깨진 인덱스 전달만 최소한으로 고치는 방향으로 올렸습니다. (`dist/` · 버전 변경 제외)
- **링크**: PR <https://github.com/entrylabs/entryjs/pull/3074>

## 3. entryjs — 속성 사용처 패널: 오브젝트/장면 삭제 시 미갱신 · 메모리 누수 수정 (PR 제출)

변수 · 리스트 · 신호 · 함수의 **"이 속성을 사용하는 오브젝트" 패널**이 블록 삭제에는 즉시 갱신되지만, **오브젝트를 직접 삭제하거나 장면 삭제로 오브젝트가 사라질 때는 갱신되지 않아** 이미 없는 오브젝트가 남고 카운트도 과다 집계되던 버그입니다.

- **원인**: `Entry.container.removeObject()`가 사용처 ref 배열(`_variableRefs` 등)을 정리하지 않습니다. `object.destroy()`도 블록 코드를 destroy하지 않다 보니 "블록 생성 시 등록 / 삭제 시 해제"의 대칭이 깨지고, ref가 오브젝트 전체를 강하게 붙잡고 있어 **삭제된 오브젝트가 GC되지 않는 메모리 누수**까지 생깁니다.
- **수정**: `variable_container.js`에 `removeRefs(objectId)`를 추가하고, `removeObject()`의 `if (isPass === true) return;` **앞**에서 호출했습니다. 두 삭제 경로(직접 삭제 · 장면 삭제)가 모두 이 한 지점을 지나므로 **한 곳만 고쳐 둘 다 해결**됩니다.
- **분석 깊이**: 4종 속성의 공통 메커니즘을 확인하고, 저장 파일 용량 영향(없음)과 런타임 메모리 누수(있음)를 구분했습니다. undo 안전성(삭제 전 `toJSON` 스냅샷 기반 복원)도 검토했고, 세 가지 수정안(A: `script` 파괴 / B: ref만 정리 / C: 렌더 필터)을 비교해 **회귀 위험이 가장 작은 B안**을 택했습니다.
- **링크**: PR <https://github.com/entrylabs/entryjs/pull/3076>

## 분석했으나 미제출 — 모양 정렬 스크롤 (entryjs)

"모양 순서를 바꾸면 목록이 맨 위로 튀는" 버그를 파고들다, 이게 **별개의 두 버그**임을 규명했습니다 — ① entryjs가 재렌더 때 스크롤을 0으로 리셋, ② entry-tool이 드래그 중 스크롤 좌표를 잘못 계산. ①은 운영자가 공식 [PR #3075](https://github.com/entrylabs/entryjs/pull/3075)로 더 일반적으로 수정했기에 **우리 준비 브랜치는 미제출로 종결**했고(우리 분석이 공식 수정 방향과 일치함을 사후 확인), #3075 범위 밖이던 ②를 직접 고쳐 위 **entry-tool #469**로 제출했습니다.

## 기여 방식 · 원칙

- 기존 로컬 작업 폴더를 건드리지 않으려고 **PR 전용 클론**을 따로 만들고, `develop`을 기준으로 기능 브랜치를 분리했습니다.
- 변경은 **소스 파일만 최소화**하고(`dist/` · 버전 변경 제외), 정적 검사 → 테스트 → 빌드 → 로컬 브라우저 검증 순서로 진행했습니다.
- 새 DOM/Web API를 쓰는 PR은 **브라우저 호환성 체크리스트**(Babel은 `Element.closest` 같은 DOM API를 자동 폴리필하지 않습니다)를 먼저 점검했습니다.

## 기술 스택 · 환경

`entryjs (TypeScript · webpack · pnpm 9 · Jest)` · `entry-tool (React · react-sortable-hoc · react-custom-scroll)` · `GitHub fork & PR 워크플로` · `브라우저 자동화 검증`
