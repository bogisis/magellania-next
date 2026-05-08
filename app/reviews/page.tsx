import type { Metadata } from 'next';
import Link from 'next/link';
import { content } from '@/lib/content';
import SchemaOrg from '@/components/SchemaOrg';
import ReviewsSection from '@/components/ReviewsSection';
import { colors, fonts } from '@/lib/brand';

const reviews = content.reviews;
const { aggregate } = reviews;

function pluralReviews(n: number): string {
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return 'отзывов';
  const m10 = n % 10;
  if (m10 === 1) return 'отзыв';
  if (m10 >= 2 && m10 <= 4) return 'отзыва';
  return 'отзывов';
}

const description = `Отзывы гостей Magellania Travel об экскурсиях в Ушуайе и на Огненной Земле: ${aggregate.count} ${pluralReviews(aggregate.count)}, средний рейтинг ${aggregate.rating.toFixed(1)} из 5. Малые группы, русскоязычный гид с 2018.`;

export const metadata: Metadata = {
  title: 'Отзывы гостей о турах в Ушуайе | Magellania Travel',
  description,
  openGraph: {
    title: 'Отзывы гостей о турах в Ушуайе',
    description: `${aggregate.count} отзывов, рейтинг ${aggregate.rating.toFixed(1)}/5. Русскоязычный гид.`,
  },
  alternates: { canonical: 'https://magellania.net/reviews/' },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Magellania Travel',
  url: 'https://magellania.net',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: aggregate.rating,
    reviewCount: aggregate.count,
    bestRating: 5,
    worstRating: 1,
  },
  review: reviews.items.map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.name },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: r.rating ?? 5,
      bestRating: 5,
    },
    reviewBody: r.text,
    datePublished: r.dateISO ?? r.date,
    itemReviewed: { '@type': 'TouristTrip', name: r.tour },
  })),
};

export default function ReviewsPage() {
  const cta = reviews.cta as Record<string, string> | undefined;

  return (
    <main>
      <SchemaOrg schema={schema} />

      {/* Hero */}
      <div
        style={{
          background: colors.ocean800,
          paddingTop: 112,
          paddingBottom: 56,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
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
            Отзывы
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
            Что говорят гости
          </h1>
        </div>
      </div>

      {/* All reviews (ReviewsSection without limit shows aggregate) */}
      <ReviewsSection />

      {/* CTA */}
      {cta && (
        <section
          style={{
            padding: '80px 24px',
            background: colors.ocean800,
            color: colors.earth100,
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: fonts.display,
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: 'clamp(1.8rem,3.5vw,2.8rem)',
                marginBottom: 16,
              }}
            >
              {cta.heading}
            </h2>
            <p
              style={{
                fontFamily: fonts.body,
                color: 'rgba(248,245,240,0.65)',
                lineHeight: 1.6,
                marginBottom: 32,
                fontSize: 14,
              }}
            >
              {cta.text}
            </p>
            <Link
              href={cta.buttonHref || '/contact/'}
              style={{
                fontFamily: fonts.body,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '16px 32px',
                background: colors.terra500,
                color: colors.earth100,
                borderRadius: 2,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              {cta.buttonLabel} &rarr;
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
