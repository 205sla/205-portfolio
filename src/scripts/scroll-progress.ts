/**
 * 상단 가로 스크롤 진행 바 채우기.
 * `<div class="scroll-bar"><i id="..."></i></div>` 마크업과 함께 사용.
 *
 * @param fillId 채워지는 `<i>` 요소의 id (메인: `scroll-i`, 상세: `scroll-fill`)
 */
export function setupScrollProgress(fillId: string) {
  const fill = document.getElementById(fillId);
  if (!fill) return;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    fill.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}
