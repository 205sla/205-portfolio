/** Hero "205" 숫자 클릭 시 살짝 튀어오르는 인터랙션. */
export function setupHeroEasterEgg() {
  document.querySelectorAll<HTMLElement>('.hero-205 .digit').forEach(d => {
    d.addEventListener('click', () => {
      d.style.transition = 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      d.style.transform = `translateY(-30px) rotate(${Math.random() * 24 - 12}deg)`;
      setTimeout(() => { d.style.transform = ''; }, 800);
    });
  });
}
