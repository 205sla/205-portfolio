/**
 * frontmatter `year` 필드는 number | string. 문자열이면 첫 4자리를
 * 숫자로 추출. 정렬 등 비교용으로 사용. 못 뽑으면 0.
 */
export function parseYear(y: number | string | undefined | null): number {
  if (typeof y === 'number') return y;
  const m = String(y ?? '').match(/\d{4}/);
  return m ? Number(m[0]) : 0;
}
