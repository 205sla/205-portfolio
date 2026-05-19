import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages 호스팅용 설정.
// 커스텀 도메인 205.kr 사용 — public/CNAME 에 `205.kr` 한 줄.
// repo 기본 URL(205sla.github.io/205-portfolio/) 로 되돌리려면:
//   site: 'https://205sla.github.io', base: '/205-portfolio/'
// + CNAME 파일 제거.
export default defineConfig({
  site: 'https://205.kr',
  base: '/',
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: { assets: '_assets' },
});
