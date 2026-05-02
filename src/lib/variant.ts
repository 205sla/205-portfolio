import type { CollectionEntry } from 'astro:content';
import type { MarkdownHeading } from 'astro';

const SHORT_LIMIT = 600;
const LONG_HEADING_MIN = 3;

export type Variant = 'long' | 'medium' | 'short' | 'empty';

export function resolveVariant(
  entry: CollectionEntry<'projects'>,
  headings: MarkdownHeading[],
): Variant {
  if (entry.data.variant) return entry.data.variant;
  if (entry.data.external_only) return 'empty';

  const len = entry.body.replace(/\s+/g, '').length;
  if (len < 80) return 'empty';

  const h2Count = headings.filter(h => h.depth === 2).length;
  if (h2Count >= LONG_HEADING_MIN) return 'long';
  if (len < SHORT_LIMIT) return 'short';
  return 'medium';
}

export function sortByCategoryOrder(
  entries: CollectionEntry<'projects'>[],
): CollectionEntry<'projects'>[] {
  return [...entries].sort((a, b) => {
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
    const ya = typeof a.data.year === 'number' ? a.data.year
             : Number.parseInt(String(a.data.year ?? 0).match(/\d{4}/)?.[0] ?? '0', 10);
    const yb = typeof b.data.year === 'number' ? b.data.year
             : Number.parseInt(String(b.data.year ?? 0).match(/\d{4}/)?.[0] ?? '0', 10);
    if (ya !== yb) return yb - ya;
    return (a.data.order ?? 0) - (b.data.order ?? 0);
  });
}

export function findAdjacent(
  entries: CollectionEntry<'projects'>[],
  current: CollectionEntry<'projects'>,
): { prev: CollectionEntry<'projects'> | null; next: CollectionEntry<'projects'> | null } {
  const sameCategory = sortByCategoryOrder(
    entries.filter(e => e.data.category === current.data.category && !e.data.draft),
  );
  const idx = sameCategory.findIndex(e => e.id === current.id);
  return {
    prev: idx > 0 ? sameCategory[idx - 1] : null,
    next: idx >= 0 && idx < sameCategory.length - 1 ? sameCategory[idx + 1] : null,
  };
}
