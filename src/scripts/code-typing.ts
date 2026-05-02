/**
 * About 섹션 코드 블록의 C++ 타이핑 애니메이션.
 *
 * 마크업: `#codeblock` 안에 `#codetype`(타이핑 타깃)과
 * `#runbtn`(다시 실행 버튼)이 있어야 함.
 *
 * IntersectionObserver로 viewport 진입 시 1회 자동 시작,
 * "▶ run" 버튼으로 재실행 가능.
 */

type TokenType = 'pp' | 'kw' | 'ty' | 'fn' | 'st' | 'cm' | 'nu' | 'tx' | 'br';
interface Token { type: TokenType; text?: string; }

const TOKENS: Token[] = [
  { type: 'pp', text: '#include' }, { type: 'tx', text: ' <iostream>' },
  { type: 'br' },
  { type: 'kw', text: 'using' }, { type: 'tx', text: ' ' },
  { type: 'kw', text: 'namespace' }, { type: 'tx', text: ' std;' },
  { type: 'br' }, { type: 'br' },
  { type: 'ty', text: 'int' }, { type: 'tx', text: ' ' },
  { type: 'fn', text: 'main' }, { type: 'tx', text: '() {' },
  { type: 'br' },
  { type: 'tx', text: '    ' }, { type: 'tx', text: 'cout << ' },
  { type: 'st', text: '"열심히 공부하는 중!"' }, { type: 'tx', text: ' << endl;' },
  { type: 'br' },
  { type: 'tx', text: '}' },
];

function renderLines(lines: string[]) {
  return lines
    .map((ln, i) => `<div class="ln"><span class="gutter">${i + 1}</span><span>${ln}</span></div>`)
    .join('');
}

function tokensToLines(tks: Token[]): string[] {
  const lines: string[] = [''];
  for (const t of tks) {
    if (t.type === 'br') { lines.push(''); continue; }
    const cls = t.type === 'tx' ? '' : t.type;
    lines[lines.length - 1] += cls
      ? `<span class="${cls}">${t.text ?? ''}</span>`
      : t.text ?? '';
  }
  return lines;
}

interface TypingState {
  idx: number;
  charIdx: number;
  running: boolean;
  timer: ReturnType<typeof setTimeout> | null;
}

export function setupCodeTyping() {
  const codeEl = document.getElementById('codetype');
  const runBtn = document.getElementById('runbtn');
  const codeBlock = document.getElementById('codeblock');
  if (!codeEl || !runBtn || !codeBlock) return;

  const state: TypingState = { idx: 0, charIdx: 0, running: false, timer: null };

  const step = () => {
    const partial = TOKENS.slice(0, state.idx + 1).map((t, i) => {
      if (t.type === 'br' || i < state.idx) return t;
      return { ...t, text: (t.text ?? '').substring(0, state.charIdx) };
    });
    const lines = tokensToLines(partial);
    if (lines.length) lines[lines.length - 1] += '<span class="cursor"></span>';
    codeEl.innerHTML = renderLines(lines);

    const cur = TOKENS[state.idx];
    if (!cur) { state.running = false; return; }
    if (cur.type === 'br') {
      state.idx++;
      state.charIdx = 0;
      state.timer = setTimeout(step, 40);
      return;
    }
    const len = cur.text?.length ?? 0;
    if (state.charIdx < len) {
      state.charIdx++;
      state.timer = setTimeout(step, 22 + Math.random() * 20);
    } else {
      state.idx++;
      state.charIdx = 0;
      state.timer = setTimeout(step, 40);
    }
  };

  const start = () => {
    if (state.running) return;
    state.idx = 0;
    state.charIdx = 0;
    state.running = true;
    state.timer = null;
    codeEl.innerHTML = '';
    step();
  };

  // viewport 진입 시 1회 자동 시작
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        start();
        io.disconnect();
      }
    }
  }, { threshold: 0.3 });
  io.observe(codeBlock);

  runBtn.addEventListener('click', () => {
    if (state.timer) clearTimeout(state.timer);
    state.running = false;
    start();
  });
}
