import type { CollectionEntry } from 'astro:content';
import { parseYear } from './year';

/**
 * 프로젝트 컬렉션의 표준 정렬 룰.
 *
 *  1) featured 먼저
 *  2) order(수동 정렬 override) 오름차순. 미설정은 999로 취급
 *  3) year 내림차순 (최신 먼저)
 *
 * 갤러리 카드 순서와 detail 페이지의 prev/next 순서가
 * 같은 룰을 사용하도록 한 곳에 모음.
 */
export function sortProjects(
  entries: CollectionEntry<'projects'>[],
): CollectionEntry<'projects'>[] {
  return [...entries].sort((a, b) => {
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
    const oa = a.data.order ?? 999;
    const ob = b.data.order ?? 999;
    if (oa !== ob) return oa - ob;
    return parseYear(b.data.year) - parseYear(a.data.year);
  });
}
