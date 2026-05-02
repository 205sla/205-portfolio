import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages 호스팅용 설정.
// 추후 커스텀 도메인(205.kr) 연결 시:
//   site: 'https://205.kr', base: '/'
// + public/CNAME 파일에 도메인 적기.
export default defineConfig({
  site: 'https://205sla.github.io',
  base: '/205-portfolio/',
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: { assets: '_assets' },
});
