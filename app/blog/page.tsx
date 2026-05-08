import type { Metadata } from 'next';
import Link from 'next/link';
import { content } from '@/lib/content';
import SchemaOrg from '@/components/SchemaOrg';
import { colors, fonts } from '@/lib/brand';

const posts = content.blog.posts;

export const metadata: Metadata = {
  title: 'Блог Magellania — Путеводители по Ушуайе и Патагонии',
  description:
    '16 статей от русскоязычных гидов в Ушуайе: маршруты по Патагонии, когда ехать, пингвины Мартильо, канал Бигля, пролив Дрейка, Антарктида. Советы и цены.',
  openGraph: {
    title: 'Блог Magellania — Путеводители по Ушуайе и Патагонии',
    description:
      'Статьи от русскоязычных гидов: маршруты, советы, цены.',
  },
  alternates: { canonical: 'https://magellania.net/blog/' },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Блог Magellania — Путеводители по Ушуайе и Патагонии',
  description:
    '16 статей от русскоязычных гидов в Ушуайе: маршруты, советы, цены.',
  url: 'https://magellania.net/blog',
  publisher: {
    '@type': 'TravelAgency',
    name: 'Magellania Travel',
    url: 'https://magellania.net',
  },
  numberOfItems: posts.length,
};

export default function BlogPage() {
  return (
    <main>
      <SchemaOrg schema={schema} />

      <div
        style={{
          background: colors.ocean800,
          paddingTop: 112,
          paddingBottom: 56,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <span
            style={{
              fontFamily: fonts.body,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: colors.terra500,
              display: 'block',
              marginBottom: 12,
            }}
          >
            Блог
          </span>
          <h1
            style={{
              fontFamily: fonts.display,
              color: colors.earth100,
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(2rem,4vw,3.2rem)',
            }}
          >
            Путеводители и советы
          </h1>
        </div>
      </div>

      <section style={{ padding: '64px 24px', background: colors.earth200 }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          {posts.length === 0 ? (
            <p
              style={{
                fontFamily: fonts.body,
                color: '#5c5040',
                fontSize: 14,
              }}
            >
              Статьи скоро появятся.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 24,
              }}
            >
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}/`}
                  style={{
                    display: 'block',
                    background: colors.earth100,
                    borderRadius: 4,
                    padding: 24,
                    border: '1px solid rgba(13,31,53,0.08)',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: colors.terra500,
                      }}
                    >
                      {post.publishedAt}
                    </span>
                    <span
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 9,
                        letterSpacing: '0.05em',
                        color: '#9e8e76',
                      }}
                    >
                      {post.author}
                    </span>
                  </div>
                  <h2
                    style={{
                      fontFamily: fonts.display,
                      color: colors.ocean800,
                      fontSize: '1.1rem',
                      fontWeight: 400,
                      lineHeight: 1.3,
                      marginBottom: 12,
                    }}
                  >
                    {post.title}
                  </h2>
                  <p
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: '#5c5040',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: 16,
                    }}
                  >
                    {post.lead}
                  </p>
                  {post.tags?.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginBottom: 16,
                      }}
                    >
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontFamily: fonts.body,
                            fontSize: 9,
                            letterSpacing: '0.05em',
                            color: '#9e8e76',
                            background: 'rgba(13,31,53,0.05)',
                            border: '1px solid rgba(13,31,53,0.08)',
                            padding: '2px 8px',
                            borderRadius: 2,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: colors.terra500,
                    }}
                  >
                    Читать &rarr;
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
