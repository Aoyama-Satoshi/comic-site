// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server', // 💡サーバーモードを有効にする（これで裏口APIが稼働します！）
  adapter: vercel(),
});