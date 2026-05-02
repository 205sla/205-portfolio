/**
 * 우측 사이드 스크롤 도트의 active 상태 동기화.
 * 현재 viewport 40% 지점이 어느 섹션에 들어와 있는지 보고
 * 해당 도트에 .active 클래스를 부여.
 */
const SECTION_IDS = ['hero', 'about', 'skills', 'works', 'highlights', 'awards', 'contact'];

export function setupSectionScrollDots() {
  const dots = document.querySelectorAll<HTMLElement>('.scroll-dots a');
  if (dots.length === 0) return;
  const sections = SECTION_IDS.map(id => document.getElementById(id));
  const update = () => {
    const y = window.scrollY + window.innerHeight * 0.4;
    let active = 0;
    sections.forEach((s, i) => { if (s && s.offsetTop <= y) active = i; });
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}
