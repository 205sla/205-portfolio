---
title: Shorts — 2D 충돌 대결 시뮬레이션 (YouTube Shorts 자동 생성)
category: game
cover:
  style: mood
links:
  github: https://github.com/205sla/Shorts
description: 2D 물리 충돌 대결 시뮬레이션을 자동으로 렌더링하여 **YouTube Shorts(9:16)** 영상을 생성하는 파이프라인입니다.
---

2D 물리 충돌 대결 시뮬레이션을 자동으로 렌더링하여 **YouTube Shorts(9:16)** 영상을 생성하는 파이프라인입니다.

캐릭터들이 아레나에서 충돌하며 HP를 깎고, 최후의 1명이 남을 때까지 대결합니다. 각 캐릭터는 고유 스킬, 히트 이펙트, 효과음을 가집니다.

## 주요 특징

- **9종 캐릭터** — 각각 고유 스킬과 시각 효과 보유
- **데이터 주도 설계** — 캐릭터/스킬을 JSON만으로 추가 (코드 수정 최소화)
- **2D 물리 엔진** — 탄성 충돌, 호밍, 벽 반사
- **헤드리스 렌더링** — Pygame + SDL dummy 드라이버로 화면 없이 렌더링
- **NVENC GPU 가속** — RTX GPU 자동 감지, ffmpeg 직접 파이프로 2.4× 고속 인코딩
- **CTA 오버레이** — 구독/좋아요 유도 크로마키 영상을 초반/중반/후반에 랜덤 배치
- **오디오 합성** — BGM 랜덤 선택 + SFX 정밀 타이밍 믹싱
- **메타데이터 출력** — 전투 통계, 페이싱 분석, CTA 배치 기록 등 (실적 비교용 JSON)
- **부활 시스템** — 20초 전 조기 종료 방지, 죽은 캐릭터가 능력치 강화되어 부활
- **확장 가능 구조** — 100+ 캐릭터 대응 모듈 아키텍처

## 캐릭터

| ID | Name | Skill | Hit Effect |
|---|---|---|---|
| 001 | Blaze | Dash (가속 돌진) | Fire Burst |
| 002 | Mossy | Heal (체력 회복) | Leaf Scatter |
| 003 | Titan | Size Up (거대화) | Shockwave |
| 004 | Echo | Reflect (데미지 반사) | Mirror Flash |
| 005 | Necromancer | Summon (미니언 소환) | Skull Puff |
| 006 | Devourer | Gravity Pull + Grow | Void Crack |
| 007 | BloodLord | Lifesteal + Berserk | Blood Drip |
| 008 | Glitch | Teleport / Swap | Glitch Noise |
| 009 | Railgun | Ultra Dash + Screen Shake | Electric Bolt |

## 사용

```bash
pip install -r requirements.txt
conda install -y ffmpeg -c conda-forge

python -m src.main                     # 단일 영상 생성
python -m src.main --players 3         # 3인전
python -m src.main --seed 42           # 재현 가능
generate.bat                           # 5개 연속 생성
```

