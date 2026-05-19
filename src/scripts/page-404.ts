/**
 * 404 페이지 인터랙션:
 *  - 우상단 타임스탬프 ("Lost since · YYYY.MM.DD HH:MM") 채워넣기
 *  - 큰 "404" 숫자 클릭 시 살짝 튀어오르는 wobble; 5번 모이면 body 에
 *    `is-205` 클래스를 토글해 4-0-4 가 잠깐 2-0-5 로 보이는 이스터에그
 *  - 캐릭터 말풍선이 3초마다 다른 문구로 바뀜
 *
 *  메인 페이지에서는 호출하지 않음 — 404 페이지에서만 사용.
 */
export function setup404() {
  if (typeof window === 'undefined') return;

  /* ------- 1. timestamp ------- */
  const ts = document.getElementById('ts');
  if (ts) {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    ts.textContent =
      `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /* ------- 2. digit wobble + 5-click 404↔205 easter egg ------- */
  let clickCount = 0;
  document.querySelectorAll<HTMLElement>('.h404 .d').forEach((d) => {
    d.addEventListener('click', () => {
      d.style.transition = 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      d.style.transform =
        `translateY(-30px) rotate(${(Math.random() * 24 - 12).toFixed(2)}deg)`;
      window.setTimeout(() => {
        d.style.transform = '';
      }, 800);

      clickCount++;
      if (clickCount >= 5) {
        document.body.classList.toggle('is-205');
        clickCount = 0;
      }
    });
  });

  /* ------- 3. speech bubble rotation ------- */
  const speeches = [
    '어… 여긴 어디지?',
    '길을 잃었어요 😵',
    '합작에 늦었나봐요',
    '404가 뭐예요?',
    '집에 갈래요…',
  ];
  let idx = 0;
  const bubble = document.querySelector<HTMLElement>('.char .speech');
  if (bubble) {
    bubble.style.transition = 'opacity 200ms ease';
    window.setInterval(() => {
      idx = (idx + 1) % speeches.length;
      bubble.style.opacity = '0';
      window.setTimeout(() => {
        bubble.textContent = speeches[idx];
        bubble.style.opacity = '1';
      }, 200);
    }, 3000);
  }
}
