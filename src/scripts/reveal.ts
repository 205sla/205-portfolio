/**
 * 스크롤 reveal — viewport에 진입하면 fade-in + 살짝 위로 이동.
 * 한 번 보여진 요소는 다시 트리거되지 않음.
 * `prefers-reduced-motion: reduce`인 사용자에게는 적용 안 함.
 */

const SELECTORS = [
  // 메인 페이지
  '.section-head',
  '.about-grid',
  '.skills-grid',
  '.external-channels',
  '.masonry',
  '.highlight-grid > *',
  '.awards-list > *',
  '.foot-grid > *',
  // 상세 페이지
  '.page-header',
  '.layout > .body > *',
  '.compact-card',
  '.empty-state',
  '.related',
  '.page-end > .row',
];

export function setupReveal() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = Array.from(document.querySelectorAll<HTMLElement>(SELECTORS.join(', ')));
  if (targets.length === 0) return;

  targets.forEach(el => el.classList.add('reveal-init'));

  const io = new IntersectionObserver(
    entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );

  targets.forEach(t => io.observe(t));
}
