/**
 * About 섹션 아래 가로로 표시되는 외부 채널 카드.
 *
 * 추가/수정/삭제 → 이 배열만 편집하면 됩니다.
 */

export type IconKey =
  | 'github' | 'youtube' | 'instagram' | 'entry'
  | 'namu' | 'naver' | 'yes24' | 'kyobo'
  | 'site' | 'band';

export interface Channel {
  /** 표시할 채널명 (예: "GitHub") */
  label: string;
  /** 부제 — 작은 글씨 (예: "@205sla") */
  sub?: string;
  /** 외부 URL */
  url: string;
  /** 아이콘 키 — src/components/ExternalChannels.astro의 SVG 매핑 */
  icon: IconKey;
}

export const CHANNELS: Channel[] = [
  { label: 'GitHub',     sub: '205sla',        url: 'https://github.com/205sla',                                                            icon: 'github' },
  { label: 'YouTube',    sub: '205와 엔트리',  url: 'https://www.youtube.com/@205',                                                          icon: 'youtube' },
  { label: 'Instagram',  sub: '205_youngholee', url: 'https://www.instagram.com/205_youngholee/',                                            icon: 'instagram' },
  { label: 'Entry',      sub: 'lyh2315',       url: 'https://playentry.org/profile/56136825dadc91e1235b460d',                                icon: 'entry' },
  { label: '나무위키',    sub: '이영호(2003)',  url: 'https://namu.wiki/w/%EC%9D%B4%EC%98%81%ED%98%B8(2003)',                                  icon: 'namu' },
  { label: '네이버',      sub: '인물 검색',     url: 'https://search.naver.com/search.naver?query=이영호',                                     icon: 'naver' },
  { label: 'Yes24',      sub: '작가 페이지',   url: 'https://www.yes24.com/24/AuthorFile/Author/437179',                                     icon: 'yes24' },
  { label: '교보문고',    sub: '작가 페이지',   url: 'https://www.kyobobook.co.kr/service/profile/information?chrcCode=1000260131',           icon: 'kyobo' },
];
