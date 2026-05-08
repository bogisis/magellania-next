import type { Metadata } from 'next';
import { colors, fonts } from '@/lib/brand';
import SchemaOrg from '@/components/SchemaOrg';
import PricesTable from '@/components/PricesTable';

export const metadata: Metadata = {
  title: 'Цены на экскурсии в Ушуайе | Magellania Travel',
  description:
    'Актуальные цены на экскурсии в Ушуайе: канал Бигля от $144, пингвины от $200, нацпарк от $120, вертолёт от $700. Группы 1–3 человека, русскоязычный гид.',
  openGraph: {
    title: 'Цены на экскурсии | Magellania Travel',
    description:
      'Актуальные цены на экскурсии в Ушуайе от $120. Русскоязычный гид.',
  },
  alternates: { canonical: 'https://magellania.net/prices/' },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Цены на экскурсии в Ушуайе — Magellania Travel',
  description:
    'Актуальные цены на экскурсии и услуги в Ушуайе.',
  url: 'https://magellania.net/prices',
};

export default function PricesPage() {
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
            Цены
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
            Стоимость экскурсий
          </h1>
        </div>
      </div>

      <section style={{ padding: '64px 24px', background: colors.earth200 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <PricesTable />
        </div>
      </section>
    </main>
  );
}
