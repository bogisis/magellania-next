#!/usr/bin/env node
// Конвертирует ui_kits/website/Content.js → src/data/content.json
// Запускать: node scripts/export-content.js
// Или автоматически при: npm run build

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const srcPath  = resolve(__dir, '../../website/Content.js');
const destPath = resolve(__dir, '../data/content.json');

// Читаем Content.js и исполняем в мини-контексте
const src = readFileSync(srcPath, 'utf8');
const window = {};
// Убираем "window.CONTENT = " — eval остального
eval(src.replace(/^\/\/.*$/gm, ''));  // комментарии оставим, eval справится

const content = window.CONTENT;
if (!content) {
  console.error('❌  window.CONTENT не найден в Content.js');
  process.exit(1);
}

writeFileSync(destPath, JSON.stringify(content, null, 2), 'utf8');
console.log(`✓  content.json экспортирован → data/content.json`);
console.log(`   Туров: ${content.tours?.length ?? 0} | Статей блога: ${content.blog?.posts?.length ?? 0}`);

// Генерация sitemap.xml
const base = 'https://magellania.net';
const now = new Date().toISOString().slice(0, 10);

const staticPages = ['/', '/tours/', '/blog/', '/about/', '/b2b/', '/faq/', '/contact/', '/reviews/'];
const tourPages   = (content.tours ?? []).map(t => `/tours/${t.slug}/`);
const blogPages   = (content.blog?.posts ?? []).map(p => `/blog/${p.slug}/`);

const urls = [...staticPages, ...tourPages, ...blogPages]
  .map(path => `  <url><loc>${base}${path}</loc><lastmod>${now}</lastmod></url>`)
  .join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

const sitemapPath = resolve(__dir, '../public/sitemap.xml');
writeFileSync(sitemapPath, sitemapXml, 'utf8');
console.log(`✓  sitemap.xml сгенерирован (${staticPages.length + tourPages.length + blogPages.length} URLs)`);
