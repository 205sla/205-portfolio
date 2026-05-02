import type { CollectionEntry } from 'astro:content';

/** projects 컬렉션 entry id에서 라우트 슬러그 추출. */
export function slugOf(entry: CollectionEntry<'projects'>): string {
  return entry.id.replace(/\/index$/, '').replace(/\.md$/, '');
}

/** 슬러그로부터 base-aware 절대 경로 생성. trailing slash 보장. */
export function projectHrefBySlug(slug: string): string {
  return `${import.meta.env.BASE_URL}projects/${slug}/`.replace(/\/{2,}/g, '/');
}

/** entry로부터 직접 base-aware 절대 경로 생성. */
export function projectHref(entry: CollectionEntry<'projects'>): string {
  return projectHrefBySlug(slugOf(entry));
}
