/** Skills 섹션의 "젓가락질" 칩 클릭 시 비밀 메시지 토글. */
export function setupSecretChip() {
  const secret = document.getElementById('secret-chip');
  if (!secret) return;
  secret.addEventListener('click', () => secret.classList.toggle('open'));
}
