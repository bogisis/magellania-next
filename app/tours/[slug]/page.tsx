import type { Metadata } from 'next';
import Link from 'next/link';
import { content, getTour, getAllTourSlugs } from '@/lib/content';
import SchemaOrg from '@/components/SchemaOrg';
import { colors, fonts } from '@/lib/brand';
import { notFound } from 'next/navigation';
import TourBookingWidget from '@/components/TourBookingWidget';
import { buildPriceMap, getTourVariants, rowDisplayPrice, rowNote, isGuideRow } from '@/lib/pricing';

// ── Static params ──────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllTourSlugs().map((slug) => ({ slug }));
}

// ── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) return { title: 'Tour not found' };

  const ogImage = tour.gallery?.[0]
    ? `/img/tours/${encodeURIComponent(typeof tour.gallery[0] === 'string' ? tour.gallery[0] : tour.gallery[0].file)}`
    : '/og-default.jpg';

  return {
    title: tour.metaTitle || `${tour.title} | Magellania, Ушуайя`,
    description: tour.metaDesc || tour.lead || tour.desc,
    openGraph: {
      title: tour.metaTitle || tour.title,
      description: tour.metaDesc || tour.lead,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://magellania.net/tours/${tour.slug}/`,
    },
  };
}

// ── Styles ─────────────────────────────────────────────────────────────────

const eyebrow: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(248,245,240,0.6)',
  display: 'block',
  marginBottom: 8,
};

const sectionLabel: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#9e8e76',
  marginBottom: 20,
};

const paramDt: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(248,245,240,0.4)',
  marginBottom: 2,
};

const paramDd: React.CSSProperties = {
  fontFamily: fonts.display,
  color: colors.earth100,
  fontSize: '1rem',
  lineHeight: 1,
};

// ── Page ───────────────────────────────────────────────────────────────────

export default async function TourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) notFound();

  const tourPrice = tour.price ?? `от $${tour.priceBase}`;
  const priceValue = tour.priceBase ?? 0;

  // Gallery helpers
  const getFilename = (item: any): string =>
    typeof item === 'string' ? item : item.file;
  const getAlt = (item: any): string =>
    typeof item === 'string' ? tour.title : item.alt || tour.title;

  // Hero image
  const heroFilename = tour.gallery?.[0] ? getFilename(tour.gallery[0]) : null;
  const heroStyle: React.CSSProperties = {
    height: 420,
    background: heroFilename
      ? `url('/img/tours/${encodeURIComponent(heroFilename)}') center/cover no-repeat`
      : tour.bg || colors.ocean700,
    position: 'relative',
  };

  // Related tours by tags
  const related = content.tours
    .filter(
      (t) =>
        t.slug !== tour.slug &&
        t.tags?.some((tag) => tour.tags?.includes(tag))
    )
    .slice(0, 3);

  // Related blog posts
  const relatedPosts = tour.relatedPosts?.length
    ? content.blog.posts.filter((p) =>
        tour.relatedPosts.includes(p.slug)
      )
    : content.blog.posts
        .filter((p) => p.relatedTours?.includes(tour.slug))
        .slice(0, 3);

  // Meta items for info chips
  const metaItems = [
    tour.duration && { icon: '⏱', label: tour.duration },
    tour.transport && { icon: '🚗', label: tour.transport },
    tour.maxGroup && { icon: '👥', label: tour.maxGroup },
    tour.language && { icon: '🌍', label: tour.language },
    tour.season && { icon: '📅', label: tour.season },
    tour.childrenOk && { icon: '👶', label: 'Можно с детьми' },
  ].filter(Boolean) as Array<{ icon: string; label: string }>;

  // ── Pricing data (static, for crawlers) ──────────────────────────────────
  const priceMap = buildPriceMap(content.prices);
  const variantKeys = getTourVariants(tour);
  const variantRows = variantKeys
    .map((k) => {
      const row = priceMap[k];
      if (!row) return null;
      return {
        key: k,
        name: row.name || k,
        price: rowDisplayPrice(row),
        note: rowNote(row),
        desc: row.desc || '',
        isGuide: isGuideRow(row),
        raw: row,
      };
    })
    .filter(Boolean) as Array<{
    key: string;
    name: string;
    price: string;
    note: string;
    desc: string;
    isGuide: boolean;
    raw: any;
  }>;

  // Build Schema.org offers from variant rows
  const schemaOffers = variantRows.map((v) => {
    const num = parseFloat(v.price.replace(/[^0-9.]/g, '')) || priceValue;
    return {
      '@type': 'Offer' as const,
      name: v.name,
      description: v.desc || v.note,
      price: num,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    };
  });

  // Schema.org
  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': tour.schemaType ?? 'TouristTrip',
      name: tour.title,
      description: tour.lead ?? tour.desc,
      url: `https://magellania.net/tours/${tour.slug}`,
      image: heroFilename
        ? `https://magellania.net/img/tours/${encodeURIComponent(heroFilename)}`
        : undefined,
      touristType: 'Russian-speaking tourists',
      availableLanguage: { '@type': 'Language', name: 'Russian' },
      offers:
        schemaOffers.length > 1
          ? schemaOffers
          : {
              '@type': 'Offer',
              price: priceValue,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              validFrom: '2025-10-01',
            },
      provider: {
        '@type': 'TravelAgency',
        name: 'Magellania Travel',
        url: 'https://magellania.net',
      },
      ...(tour.meetingPoint && {
        departureLocation: {
          '@type': 'Place',
          name: tour.meetingPoint,
        },
      }),
    },
  ];

  if (tour.faq?.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tour.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }

  return (
    <main>
      <SchemaOrg schema={schemas} />

      {/* ── Hidden pricing data for crawlers (sr-only) ─────────────────── */}
      <div
        aria-hidden="false"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        <h2>Цены на экскурсию «{tour.title}» в Ушуайе</h2>
        <p>
          Стоимость: {tourPrice}
          {tour.priceModel === 'group' && ` за группу (${tour.maxGroup || 'до 3 чел.'})`}
          {tour.priceModel === 'person' && ' за человека'}
          . {tour.duration && `Длительность: ${tour.duration}.`}
          {tour.transport && ` Транспорт: ${tour.transport}.`}
          {tour.season && ` Сезон: ${tour.season}.`}
        </p>
        {variantRows.length > 0 && (
          <table>
            <caption>
              Варианты экскурсии «{tour.title}» — Magellania Travel, Ушуайя
            </caption>
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Цена (USD)</th>
                <th>Тип оплаты</th>
              </tr>
            </thead>
            <tbody>
              {variantRows.map((v) => (
                <tr key={v.key}>
                  <td>
                    {v.name}
                    {v.desc && ` — ${v.desc}`}
                  </td>
                  <td>{v.price}</td>
                  <td>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tour.meetingPoint && (
          <p>Место встречи: {tour.meetingPoint}</p>
        )}
        <p>
          Бронирование: WhatsApp +54 9 2901 XXX или magellania.net.
          Русскоязычные гиды. Частные экскурсии для 1–3 человек.
        </p>
      </div>

      {/* ── Full-width Hero ────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          paddingTop: 64,
          overflow: 'hidden',
        }}
      >
        {/* Photo background */}
        <div style={{
          ...heroStyle,
          position: 'absolute',
          inset: 0,
          height: 'auto',
        }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(13,31,53,0.92) 0%, rgba(13,31,53,0.4) 40%, rgba(13,31,53,0.15) 100%)',
            }}
          />
        </div>

        {/* Spacer for photo visibility */}
        <div style={{ height: 'clamp(200px, 30vw, 340px)' }} />

        {/* Title overlay */}
        <div
          style={{
            position: 'relative',
            padding: '0 24px 32px',
            maxWidth: 1152,
            margin: '0 auto',
          }}
        >
          <span style={eyebrow}>{tour.category}</span>
          <h1
            style={{
              fontFamily: fonts.display,
              color: colors.earth100,
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(2rem,4vw,3.2rem)',
              margin: 0,
            }}
          >
            {tour.title}
          </h1>
        </div>

        {/* ── Meta bar (inside hero, over photo) ────────────────────────── */}
        <div
          style={{
            position: 'relative',
            background: 'rgba(13,31,53,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '18px 24px',
          }}
        >
          <div style={{ maxWidth: 1152, margin: '0 auto' }}>
            <dl
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px 40px',
                alignItems: 'flex-start',
                margin: 0,
              }}
            >
              {tour.duration && (
                <div>
                  <dt style={paramDt}>Длительность</dt>
                  <dd style={{ ...paramDd, margin: 0 }}>{tour.duration}</dd>
                </div>
              )}
              {tour.transport && (
                <div>
                  <dt style={paramDt}>Транспорт</dt>
                  <dd style={{ ...paramDd, margin: 0 }}>{tour.transport}</dd>
                </div>
              )}
              {tour.maxGroup && (
                <div>
                  <dt style={paramDt}>Группа</dt>
                  <dd style={{ ...paramDd, margin: 0 }}>{tour.maxGroup}</dd>
                </div>
              )}
              {tour.season && (
                <div>
                  <dt style={paramDt}>Сезон</dt>
                  <dd style={{ ...paramDd, margin: 0 }}>{tour.season}</dd>
                </div>
              )}
              {tour.meetingPoint && (
                <div style={{ maxWidth: 320 }}>
                  <dt style={paramDt}>Место встречи</dt>
                  <dd style={{ ...paramDd, margin: 0, fontSize: '0.85rem' }}>{tour.meetingPoint}</dd>
                </div>
              )}
              <div
                style={{
                  marginLeft: 'auto',
                  paddingLeft: 32,
                  borderLeft: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <dt style={{ ...paramDt, color: colors.terra500 }}>
                  Цена
                </dt>
                <dd style={{ ...paramDd, fontSize: '1.25rem', margin: 0 }}>
                  {tourPrice}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* ── Two-column content ─────────────────────────────────────────── */}
      <div style={{ background: colors.earth200, padding: '56px 24px' }}>
        <div
          style={{
            maxWidth: 1152,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 48,
            alignItems: 'start',
          }}
        >
          {/* ── Left column (65%) — static content ──────────────────────── */}
          <div>
            {/* Lead / Description */}
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                color: '#2a2520',
                lineHeight: 1.7,
                marginBottom: 40,
              }}
            >
              {tour.lead ?? tour.desc}
            </p>

            {/* Program timeline */}
            {tour.program?.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={sectionLabel}>Программа</h2>
                <div style={{ paddingLeft: 0 }}>
                  {tour.program.map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 12,
                        marginBottom: i < tour.program.length - 1 ? 8 : 0,
                        alignItems: 'flex-start',
                      }}
                    >
                      {/* Time badge */}
                      <div
                        style={{
                          flexShrink: 0,
                          minWidth: 42,
                          fontFamily: fonts.body,
                          fontSize: 11,
                          fontWeight: 700,
                          color: colors.terra500,
                          letterSpacing: '0.02em',
                          paddingTop: 2,
                        }}
                      >
                        {step.time}
                      </div>
                      {/* Dot + line */}
                      <div
                        style={{
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          paddingTop: 5,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: colors.terra500,
                            flexShrink: 0,
                          }}
                        />
                        {i < tour.program.length - 1 && (
                          <div
                            style={{
                              width: 1,
                              flex: 1,
                              background: 'rgba(196,112,63,0.2)',
                              marginTop: 3,
                              minHeight: 12,
                            }}
                          />
                        )}
                      </div>
                      {/* Text */}
                      <p
                        style={{
                          fontFamily: fonts.body,
                          fontSize: 14,
                          lineHeight: 1.6,
                          color: '#4a3f33',
                          paddingBottom: i < tour.program.length - 1 ? 6 : 0,
                          margin: 0,
                        }}
                      >
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Includes / Excludes */}
            {(tour.includes?.length > 0 || tour.excludes?.length > 0) && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    tour.includes?.length && tour.excludes?.length ? '1fr 1fr' : '1fr',
                  gap: 32,
                  marginBottom: 40,
                }}
              >
                {tour.includes?.length > 0 && (
                  <div>
                    <h2 style={sectionLabel}>Включено</h2>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {tour.includes.map((item, i) => (
                        <li
                          key={i}
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'baseline',
                            fontFamily: fonts.body,
                            fontSize: 14,
                            color: '#2a2520',
                            marginBottom: 8,
                          }}
                        >
                          <span style={{ color: '#4a9e6a', fontWeight: 700, flexShrink: 0 }}>
                            {'✓'}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tour.excludes?.length > 0 && (
                  <div>
                    <h2 style={sectionLabel}>Доп. оплата</h2>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {tour.excludes.map((item, i) => (
                        <li
                          key={i}
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'baseline',
                            fontFamily: fonts.body,
                            fontSize: 14,
                            color: '#5c5040',
                            marginBottom: 8,
                          }}
                        >
                          <span style={{ color: colors.terra500, fontWeight: 700, flexShrink: 0 }}>
                            +
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Gallery grid */}
            {tour.gallery?.length > 1 && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={sectionLabel}>Фото</h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                  }}
                >
                  {tour.gallery.map((item, i) => {
                    const filename = getFilename(item);
                    const alt = getAlt(item);
                    return (
                      <a
                        key={i}
                        href={`/img/tours/${encodeURIComponent(filename)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'block',
                          overflow: 'hidden',
                          borderRadius: 4,
                          border: '1px solid rgba(13,31,53,0.1)',
                          aspectRatio: '4/3',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/img/tours/${encodeURIComponent(filename)}`}
                          alt={alt}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related blog posts */}
            {relatedPosts.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={sectionLabel}>Читать по теме</h2>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {relatedPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}/`}
                      style={{
                        display: 'block',
                        padding: 16,
                        background: colors.earth100,
                        borderRadius: 4,
                        border: '1px solid rgba(13,31,53,0.08)',
                        textDecoration: 'none',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: fonts.display,
                          color: colors.ocean800,
                          fontSize: 16,
                          fontWeight: 400,
                          marginBottom: 4,
                        }}
                      >
                        {post.title}
                      </div>
                      <div
                        style={{
                          fontFamily: fonts.body,
                          fontSize: 12,
                          color: '#5c5040',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {post.lead}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ accordion — inside left column before closing */}
            {tour.faq?.length > 0 && (
              <div style={{ marginBottom: 0 }}>
                <h2 style={sectionLabel}>Частые вопросы</h2>
                <div>
                  {tour.faq.map((item, i) => (
                    <details
                      key={i}
                      style={{
                        borderBottom: '1px solid rgba(13,31,53,0.1)',
                        padding: '16px 0',
                      }}
                    >
                      <summary
                        style={{
                          fontFamily: fonts.display,
                          color: colors.ocean800,
                          fontSize: '1.1rem',
                          fontWeight: 400,
                          cursor: 'pointer',
                          listStyle: 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 16,
                          lineHeight: 1.3,
                        }}
                      >
                        <span>{item.q}</span>
                        <span
                          style={{
                            color: colors.terra500,
                            fontSize: 16,
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          +
                        </span>
                      </summary>
                      <p
                        style={{
                          fontFamily: fonts.body,
                          fontSize: 14,
                          color: '#5c5040',
                          lineHeight: 1.6,
                          marginTop: 12,
                          paddingRight: 32,
                        }}
                      >
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column (35%) — sticky booking widget ──────────────── */}
          <div>
            <TourBookingWidget tour={tour} />
          </div>
        </div>
      </div>

      {/* ── Related tours ──────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section style={{ padding: '56px 24px', background: colors.earth100 }}>
          <div style={{ maxWidth: 1152, margin: '0 auto' }}>
            <h2 style={{ ...sectionLabel, marginBottom: 24 }}>
              Похожие экскурсии
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 20,
              }}
            >
              {related.map((t) => {
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
                          marginBottom: 4,
                        }}
                      >
                        {t.title}
                      </h3>
                      <span
                        style={{
                          fontFamily: fonts.display,
                          fontSize: 14,
                          color: colors.ocean800,
                        }}
                      >
                        {t.price || `от $${t.priceBase}`}
                      </span>
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
