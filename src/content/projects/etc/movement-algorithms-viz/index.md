---
title: Game AI Movement Algorithms — 인터랙티브 시각화
category: etc
cover:
  style: cream
links:
  github: https://github.com/205sla/movement-algorithms
description: "경희대학교 인공지능 수업 **Chapter 5: Movement** 강의 내용을 기반으로 제작한 인터랙티브 시각화 도구입니다."
---

경희대학교 인공지능 수업 **Chapter 5: Movement** 강의 내용을 기반으로 제작한 인터랙티브 시각화 도구입니다.

> 교재: *AI for Games* (3rd Edition), Ian Millington

## 포함된 알고리즘 (16개 데모)

### Kinematic (속도 기반, 가속도 없음)

| 데모 | 설명 |
|---|---|
| **Seek & Flee** | 타겟 방향으로 maxSpeed 이동 / 반대 방향 도주. Overshoot 문제 확인 가능 |
| **Arrive** | 만족 반경(satisfaction radius) 내 정지. 거리 비례 감속 |
| **Wander** | `randomBinomial()`을 이용한 랜덤 배회 |

### Steering — Fundamental (가속도 기반)

| 데모 | 설명 |
|---|---|
| **Seek (Orbiting)** | 가속도 출력. Drag ON/OFF 토글로 궤도 선회(Orbiting) 문제 시각화 |
| **Arrive (Two Radii)** | targetRadius(정지) + slowRadius(감속) 두 반경 시각화 |
| **Align** | mapToRange로 최단 회전 경로 결정. Arrive의 회전 버전 |
| **Velocity Matching** | 타겟의 속도를 매칭. Flocking의 Alignment에서 사용 |

### Steering — Delegated (위임 패턴)

| 데모 | 설명 |
|---|---|
| **Pursue & Evade** | 미래 위치 예측 → Seek/Flee 위임. Evade 토글 지원 |
| **Face & LookWhereYoureGoing** | 좌우 분할 비교. Face=위치 기반, LWYG=속도 방향 기반 회전 |
| **Wander (Circle)** | 전방 원 위의 랜덤 점 → Seek 위임 |
| **Path Following** | Chase the Rabbit / Predictive 모드 전환 |
| **Collision Avoidance** | 이동 캐릭터 간 closest approach time 계산, 원뿔 탐지 |
| **Obstacle Avoidance** | Ray Casting + 법선(normal) 방향 회피. Whisker 레이 구성 |

### Combining (행동 결합)

| 데모 | 설명 |
|---|---|
| **Flocking** | Separation + Cohesion + Alignment 가중합. 힘 벡터 시각화 |
| **Blending Problems** | 안정 균형점(Stable Equilibria) / Blending vs Arbitration 비교 |

## 사용법

- **왼쪽 사이드바**: 알고리즘 선택
- **캔버스 클릭**: 타겟 위치 설정 (데모별 상이)
- **하단 버튼**: 모드 전환·파라미터 조절
- **오른쪽 패널**: 의사코드, 핵심 공식, 시험 포인트 등 상세 설명

`index.html`을 브라우저에서 열기만 하면 됩니다 (zero dependencies).

