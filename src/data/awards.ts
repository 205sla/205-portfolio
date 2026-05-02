/**
 * 메인 페이지 'Awards' 섹션의 수상 내역 데이터.
 *
 * 항목 추가/수정/삭제 → 이 배열만 편집하면 됩니다.
 *   1) 새 객체를 배열에 추가
 *   2) 또는 기존 객체의 필드만 수정
 *   3) 또는 배열에서 제거
 *
 * 정렬: 표시는 입력 순서 그대로. 보통 최신 → 오래된 순.
 *
 * 클릭 동작:
 *   - projectSlug가 있으면 → /projects/<slug>/ 로 이동
 *   - externalUrl이 있으면 → 새 탭으로 외부 링크
 *   - 둘 다 없으면 → 클릭 비활성 (커서·hover 효과 없음, 화살표도 숨김)
 */

export type AwardMedal = 'gold' | 'silver' | 'bronze';

export interface Award {
  /** 수상 연도 (또는 "—") */
  year: string | number;
  /** 메달 색 — 시각적 등급 */
  medal: AwardMedal;
  /** 수상명 (메인 라벨) */
  name: string;
  /** 부제 — 같은 줄 옅은 글씨로 표기 */
  sub?: string;
  /** 기관/주최 */
  org: string;
  /**
   * 연결할 프로젝트 페이지 슬러그.
   * 예: 'entry/site-achievement/2023-entry-10th-best-user'
   * src/content/projects/<여기>/index.md 의 경로를 그대로.
   */
  projectSlug?: string;
  /**
   * 외부 URL (projectSlug가 없을 때만 사용).
   * projectSlug가 우선됩니다.
   */
  externalUrl?: string;
}

export const AWARDS: Award[] = [
  {
    year: 2023,
    medal: 'gold',
    name: '엔트리 우수 유저상',
    sub: '엔트리 10주년 기념',
    org: '엔트리',
    projectSlug: 'entry/site-achievement/2023-entry-10th-best-user',
  },
  {
    year: 2020,
    medal: 'gold',
    name: 'FTC Rising Star Award',
    sub: '코리아로봇챔피언십 · 퀄컴 장학팀 동시 수상',
    org: 'FIRST Tech Challenge',
    projectSlug: 'contest/2020-2021-ftc',
  },
  {
    year: 2020,
    medal: 'silver',
    name: '네이버 클로바버딩 공모전 수상',
    org: 'NAVER',
    projectSlug: 'contest/2020-naver-clovabuding',
  },
  {
    year: 2019,
    medal: 'bronze',
    name: '과학동영상 공모대회 · 장려상',
    org: '국립과천과학관',
    projectSlug: 'contest/2019-science-video-contest',
  },
  {
    year: 2018,
    medal: 'silver',
    name: '엔트리 4주년 공모전',
    sub: '「내가이등이드론상」',
    org: '엔트리',
    projectSlug: 'entry/site-achievement/2018-entry-4th-anniversary',
  },
  {
    year: 2017,
    medal: 'silver',
    name: '엔트리 100만 공모전',
    sub: '「작품설명상」',
    org: '엔트리',
    projectSlug: 'entry/site-achievement/2017-entry-1m-contest',
  },
  {
    year: '—',
    medal: 'bronze',
    name: '롯데 어린이 환경 미술대회 · 장려',
    org: '롯데',
    // projectSlug / externalUrl 없음 → 클릭 비활성
  },
];
