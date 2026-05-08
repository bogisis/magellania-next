import type { Metadata } from 'next';
import Link from 'next/link';
import { content, getBlogPost, getAllBlogSlugs } from '@/lib/content';
import SchemaOrg from '@/components/SchemaOrg';
import { colors, fonts } from '@/lib/brand';
import { notFound } from 'next/navigation';

// ── Static params ──────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

// ── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Post not found' };

  return {
    title: post.metaTitle || `${post.title} | Magellania`,
    description: post.metaDesc || post.lead,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.lead,
    },
    alternates: {
      canonical: `https://magellania.net/blog/${post.slug}/`,
    },
  };
}

// ── Markdown to HTML (minimal) ─────────────────────────────────────────────

function mdToHtml(md: string): string {
  if (!md) return '';
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<h[23]>)/, '<p>')
    .replace(/$(?!<\/h[23]>)/, '</p>')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([23])><\/p>/g, '</h$1>')
    .replace(/<p>\s*<\/p>/g, '');
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const relatedTours = post.relatedTours?.length
    ? content.tours.filter((t) => post.relatedTours.includes(t.slug))
    : content.tours
        .filter((t) =>
          t.tags?.some((tag) => post.tags?.includes(tag))
        )
        .slice(0, 3);

  const schema = {
    '@context': 'https://schema.org',
    '@type': post.schemaType ?? 'Article',
    headline: post.title,
    description: post.metaDesc ?? post.lead,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Magellania Travel',
      url: 'https://magellania.net',
    },
    url: `https://magellania.net/blog/${post.slug}`,
  };

  const bodyHtml = mdToHtml(post.body ?? '');

  return (
    <main>
      <SchemaOrg schema={schema} />

      {/* Header */}
      <div
        style={{
          background: colors.ocean800,
          paddingTop: 112,
          paddingBottom: 56,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/blog/"
              style={{
                fontFamily: fonts.body,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(248,245,240,0.4)',
                textDecoration: 'none',
              }}
            >
              &larr; Блог
            </Link>
            {post.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: fonts.body,
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: colors.terra500,
                  background: 'rgba(196,112,63,0.1)',
                  border: '1px solid rgba(196,112,63,0.2)',
                  padding: '4px 10px',
                  borderRadius: 2,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <h1
            style={{
              fontFamily: fonts.display,
              color: colors.earth100,
              fontWeight: 300,
              lineHeight: 1.2,
              fontSize: 'clamp(1.8rem,3.5vw,2.8rem)',
              marginBottom: 20,
            }}
          >
            {post.title}
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                color: 'rgba(248,245,240,0.5)',
              }}
            >
              {post.author}
            </span>
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'rgba(248,245,240,0.2)',
              }}
            />
            <span
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                color: 'rgba(248,245,240,0.5)',
              }}
            >
              {post.publishedAt}
            </span>
            {post.updatedAt &&
              post.updatedAt !== post.publishedAt && (
                <>
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'rgba(248,245,240,0.2)',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: 'rgba(248,245,240,0.3)',
                    }}
                  >
                    обновлено {post.updatedAt}
                  </span>
                </>
              )}
          </div>
        </div>
      </div>

      {/* Lead */}
      <div
        style={{
          background: colors.earth100,
          borderBottom: '1px solid rgba(13,31,53,0.08)',
          padding: '32px 24px',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: fonts.display,
              color: colors.ocean800,
              fontSize: '1.1rem',
              fontWeight: 300,
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            {post.lead}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '56px 24px', background: colors.earth200 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              color: '#2a2520',
              lineHeight: 1.8,
            }}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>
      </div>

      {/* Related tours */}
      {relatedTours.length > 0 && (
        <section style={{ padding: '56px 24px', background: colors.earth100 }}>
          <div style={{ maxWidth: 1152, margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: fonts.body,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#9e8e76',
                marginBottom: 24,
              }}
            >
              Экскурсии по теме
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 20,
              }}
            >
              {relatedTours.map((t) => {
                const fn =
                  typeof t.gallery?.[0] === 'string'
                    ? t.gallery[0]
                    : t.gallery?.[0]?.file;
                const bg = fn
                  ? `url('/img/tours/${encodeURIComponent(fn)}') center/cover`
                  : t.bg || colors.ocean700;
                return (
                  <Link
                    key={t.slug}
                    href={`/tours/${t.slug}/`}
                    style={{
                      display: 'block',
                      borderRadius: 4,
                      overflow: 'hidden',
                      textDecoration: 'none',
                      border: '1px solid rgba(13,31,53,0.08)',
                      background: colors.earth100,
                    }}
                  >
                    <div
                      style={{
                        height: 160,
                        background: bg,
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(to top, rgba(13,31,53,0.5) 0%, transparent 60%)',
                        }}
                      />
                    </div>
                    <div style={{ padding: '12px 16px 16px' }}>
                      <h3
                        style={{
                          fontFamily: fonts.display,
                          fontSize: '1rem',
                          fontWeight: 400,
                          color: colors.ocean800,
                        }}
                      >
                        {t.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
