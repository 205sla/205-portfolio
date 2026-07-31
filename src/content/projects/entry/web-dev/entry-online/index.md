---
title: 엔트리 온라인 매니저 (Entry Online)
category: entry
subcategory: web-dev
cover:
  style: pink
links:
  site: https://online.205.kr
  others:
    - label: 크롬 웹스토어
      url: https://chromewebstore.google.com/detail/entry-online/jjjlfehdnndmbpehfdhefpacbbejlcma
      kind: site
    - label: 서버 GitHub
      url: https://github.com/205sla/entry-online
      kind: other
    - label: 확장 GitHub
      url: https://github.com/205sla/entry-online-extension
      kind: other
description: 엔트리 작품에 실시간 멀티플레이를 더하는 **크롬 확장 + Oracle Cloud 동기화 서버**. $ 변수·리스트를 WebSocket 방에서 실시간으로 공유합니다.
---

엔트리(Entry) 작품에 **실시간 멀티플레이**를 더하는 시스템입니다. 작품 안에서 이름이 `$`로 시작하는 변수·리스트를 **온라인 방에서 여러 명이 실시간으로 공유**합니다. 작품 제작자는 서버 코드를 한 줄도 짜지 않고 `$입장`·`$나가기` 함수와 `$` 변수만으로 멀티플레이 작품을 만들 수 있습니다.

> 본 프로젝트는 엔트리의 공식 기능이 아닙니다.

이 서비스는 **두 부분이 한 쌍으로 동작**합니다.

| 부분 | 역할 | 위치 |
|---|---|---|
| **크롬 확장** (클라이언트) | playentry.org 작품 페이지에 주입돼 `$` 변수 변경을 감지하고 서버와 주고받음 | Chrome Web Store · MV3 v1.2.2 |
| **동기화 서버** | WebSocket 방을 관리하고 상태를 중계·저장 | Oracle Cloud · `online.205.kr` |

## 작동 방식

- 작품에서 `$입장("Entry Online 아이디")`를 호출하면 해당 작품의 **방(room)** 에 입장하고 **슬롯 번호(1..N)** 를 받습니다. `$나가기` 또는 작품 정지 시 퇴장합니다.
- 입장 후에는 `$` 접두 변수·리스트의 변경을 **125ms 간격 diff** 로 감지해 서버로 보내고, 서버는 이를 같은 방의 다른 참가자에게 **패치(patch)** 로 전파합니다.
- 충돌은 **LWW(Last-Write-Wins)** 로 해소하고, 방 상태는 서버 메모리에서 관리합니다.
- 예약 변수(동기화 대상 제외):
  - `$확장프로그램` — 확장이 정상 로드되면 `1`
  - `$유저번호` — 미입장 `0`, 입장 시 내 슬롯 `1..N`
  - `$방인원수` · `$유저연결상태` — 방 인원 / 슬롯별 연결 상태(끊김 포함)

## 크롬 확장 (클라이언트)

- **Manifest V3.** 지원되는 엔트리 실행 경로(`/project/`·`/noframe/`·`/iframe/`)의 프레임에 ISOLATED world로 주입합니다(`/ws/` 만들기 화면은 비활성).
- `inject.js`가 `$입장`·`$나가기`를 후킹해 서버 상태를 작품에 적용하고, `content.js`가 `/sync` WebSocket을 소유하며 작품(MAIN) ↔ 서버 브리지 역할을 합니다.
- 전체화면 등으로 엔진 객체가 교체돼도 안전하게 퇴장 처리하며, 이미 입장 중인 중복 `$입장`은 무시합니다.
- 네트워크 단절은 **heartbeat** 로 감지하고, 잠긴 방에는 **세션 한정 재접속 정보로 같은 슬롯에만** 잠깐 복귀합니다.
- 운영 빌드가 `wss://online.205.kr/sync` 만 쓰도록 빌드 검사 도구가 강제합니다.

## 동기화 서버 (Oracle Cloud)

- **WebSocket 동기화**: `/sync` 업그레이드, 인메모리 방 관리, LWW, 재접속, 용량 측정(usage meter)
- **REST API**: 작품 등록(`/api/online`), 인증·계정(`/api/auth`·`/api/account`), 가입·로그인·프로필·약관·개인정보 처리방침 프런트 포함
- **DB**: SQLite(WAL) — `users` · `sessions` · `sync_projects` · `sync_usage`
- **등록 한도**: 계정당 작품 등록 한도(기본 1), 관리자가 0~100 범위로 조정
- **테스트**: 서버 테스트 179개 + 확장 테스트 37개 + 라이브 스모크(실제 playentry.org 탭 2개로 입장 · 슬롯 · 동기화 · 퇴장 검증)

## Pro 모드 — 방 없는 공유 채널 (v1.2.0)

기존 방(room) 모델은 정원과 슬롯이 있어서 "N명이 모여야 시작"하는 구조였습니다. Pro 모드는 슬롯·잠금 없이 **하나의 공유 채널에 계속 붙어 있는** 형태입니다.

- 서버 응답 `mode:"shared"`를 인지해 슬롯·잠금 없이 첫 `state` 수신 직후부터 `$` 변수·리스트 송신을 허용합니다.
- 슬롯 개념이 없으므로 `$유저번호`·`$유저연결상태`는 확장이 건드리지 않고, 채널 roster의 `connected`만 `$방인원수`에 반영합니다.
- 채널 정원 초과(`CHANNEL_FULL`) 시 `$확장프로그램`을 `-1`로 표시하고 수동 `$입장` 재시도만 허용합니다.
- 방 모드의 슬롯 배정·resumeToken 재접속·`$바로시작`은 그대로 유지해, 두 모델이 한 확장 안에 공존합니다.

## 그 외 주요 변경 (v1.1.6 → v1.2.2)

- **`$바로시작` (1.1.6)** — 정원이 차기 전에 현재 인원으로 방을 잠그고 시작합니다. 세션 의도가 있을 때만 서버 `forceStart`로 중계합니다.
- **재접속 중 송신 정지 (1.2.1)** — WS가 끊겨 `reconnecting` 상태가 되면 `outboundPaused`로 두어, 죽은 소켓에 드롭될 로컬 변경을 보내지 않습니다. 재접속 중 편집의 보존·재전송은 서버 권위 모델과 충돌해 server-wins로 마무리하고 별도 설계 문서로 분리했습니다.
- **payload 상한 byte 기준화 (1.2.1)** — 송신 전 JSON을 UTF-8 **바이트** 기준 56KB로 제한합니다. 문자 수로 재던 이전 방식은 한글·이모지에서 실제 바이트가 3~4배로 불어나 서버 `maxPayload`를 넘겨 1009 close를 유발했습니다.
- **patch echo 방지 보강 (1.2.1)** — 서버 patch가 id 불일치로 이름 fallback을 타도 baseline은 실제 적용 대상 id 기준으로 갱신해, 같은 값을 되돌려 보내지 않습니다.
- **최초 설치 안내 (1.2.2)** — 설치 직후 한 번만 안내 페이지를 열어 "이미 열려 있던 작품은 새로고침 필요"를 알립니다. 확장·Chrome 업데이트 때는 다시 열지 않고, 추가 권한도 요구하지 않습니다.

## 설계 · 운영 포인트

- **모놀리식 분리 (strangler-fig)**: 원래 [CODE 205](../code-205/)의 `/online` 기능이던 것을 독립 서비스로 떼어냈습니다. 운영으로 전환할 때 기존 소유자 · 등록 · 사용량만 **일회성으로 신규 DB에 이관**해 username 선점을 막았고, code205의 `/online`은 디커미션해 이 서비스가 유일 호스트가 됐습니다.
- **보안 우선 부팅(fail-fast)**: 운영에서 `SESSION_SECRET`이 짧거나 보안 쿠키가 아니면 서버가 아예 시작되지 않습니다. 공개 가입은 `SIGNUP_ENABLED`, username 이관 완료는 `USERNAME_MIGRATION_COMPLETE` 플래그로 단계적으로 엽니다.
- **관리자 앱 격리**: 관리자 API는 공개 앱 · nginx에 노출하지 않고 `127.0.0.1`에서만 수신하며, 32바이트 이상 전용 토큰을 요구합니다. 접근은 **SSH 터널** 로만 하고, Windows에서는 `open-admin.bat`이 터널과 관리자 페이지를 함께 열되 마스터 토큰을 URL · 클립보드 · 파일에 남기지 않고 30초 일회용 코드로 교환합니다.
- **배포 스택**: PM2(외부 env 파일 직접 로드) · nginx 리버스 프록시(`/sync` WebSocket Upgrade, 장기 연결) · certbot TLS(`wss://`가 공유) · **방화벽 2겹**(OCI VCN/NSG + UFW).

## 기술 스택

`Node.js 20+` · `Express` · `ws (WebSocket)` · `better-sqlite3 (SQLite WAL)` · `express-session` · `express-rate-limit` · `helmet` · `bcryptjs` · `PM2` · `nginx` · `certbot` · `Oracle Cloud (OCI)` · `Chrome Extension (MV3)`
