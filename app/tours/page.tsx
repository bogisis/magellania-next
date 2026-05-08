import type { Metadata } from 'next';
import { content } from '@/lib/content';
import SchemaOrg from '@/components/SchemaOrg';
import ToursSection from '@/components/ToursSection';

const tours = content.tours;

export const metadata: Metadata = {
  title: 'Все экскурсии в Ушуайе | Magellania Travel',
  description:
    '12 экскурсий в Ушуайе от $144 за группу: канал Бигля, пингвины Мартильо, нацпарк с поездом, вертолёт от $700, каякинг, озёра 4×4. Русскоязычный гид, 1–3 чел.',
  openGraph: {
    title: 'Все экскурсии в Ушуайе | Magellania Travel',
    description:
      '12 экскурсий от $144. Русскоязычные гиды, малые группы.',
  },
  alternates: { canonical: 'https://magellania.net/tours/' },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Экскурсии в Ушуайе — Magellania Travel',
  description: 'Все экскурсии и туры в Ушуайе с русскоязычным гидом',
  numberOfItems: tours.length,
  itemListElement: tours.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `https://magellania.net/tours/${t.slug}`,
    name: t.title,
  })),
};

export default function ToursPage() {
  return (
    <main>
      <SchemaOrg schema={schema} />

      {/* Hero */}
      <div
        style={{
          paddingTop: 72,
        }}
      >
        <div style={{ background: '#0d1f35', padding: '80px 80px 60px' }}>
          <span
            style={{
              fontFamily: "'Lora',serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#c4703f',
              display: 'block',
              marginBottom: 12,
            }}
          >
            Услуги
          </span>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: 'clamp(2.5rem,4vw,4rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#f8f5f0',
              lineHeight: 1.1,
            }}
          >
            Что мы предлагаем
          </h1>
        </div>
        <ToursSection />
      </div>
    </main>
  );
}
