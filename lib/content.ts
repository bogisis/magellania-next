// ─── Magellania Design System — Content helpers ─────────────────────────────

import type { Content, Tour, BlogPost } from '@/types';
import contentData from '@/data/content.json';

export const content = contentData as unknown as Content;

/** Find a tour by its slug */
export function getTour(slug: string): Tour | undefined {
  return content.tours.find(t => t.slug === slug);
}

/** Find a blog post by its slug */
export function getBlogPost(slug: string): BlogPost | undefined {
  return content.blog.posts.find(p => p.slug === slug);
}

/** Get all tour slugs (useful for generateStaticParams) */
export function getAllTourSlugs(): string[] {
  return content.tours.map(t => t.slug);
}

/** Get all blog post slugs (useful for generateStaticParams) */
export function getAllBlogSlugs(): string[] {
  return content.blog.posts.map(p => p.slug);
}
