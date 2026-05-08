import type { Metadata } from 'next';
import { colors, fonts } from '@/lib/brand';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'О нас — Magellania Travel | Русскоязычные гиды в Ушуайе',
  description:
    'Иван и Виктория Богатые — русскоязычные гиды в Ушуайе с 2018 года. Более 2000 довольных гостей, 12 авторских маршрутов от $144. Лицензия гида Аргентины.',
  openGraph: {
    title: 'О нас — Magellania Travel',
    description:
      'Русскоязычные гиды в Ушуайе с 2018 года. 2000+ довольных гостей.',
  },
  alternates: { canonical: 'https://magellania.net/about/' },
};

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ivan Bogatiy',
    jobTitle: 'Туристический гид, Ушуайя',
    worksFor: { '@type': 'TravelAgency', name: 'Magellania Travel' },
    knowsLanguage: ['Russian', 'Spanish', 'English'],
    areaServed: 'Ushuaia, Tierra del Fuego',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Magellania Travel',
    description:
      'Бутиковые экскурсии в Ушуайе с русскоязычными гидами',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ushuaia',
      addressRegion: 'Tierra del Fuego',
      addressCountry: 'AR',
    },
    foundingDate: '2018',
    numberOfEmployees: 2,
  },
];

const whyItems = [
  'Малые группы — максимум 3 человека в частном туре',
  'Русскоязычный сервис от первого сообщения до возвращения домой',
  'Реальные маршруты — не стандартные автобусные туры',
  'Гибкость: адаптируем программу под ваши даты, темп и интересы',
  '6+ лет работы в Ушуайе — знаем каждый сезон, погоду и нюансы',
];

const sectionLabel: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: colors.terra500,
  display: 'block',
  marginBottom: 12,
};

export default function AboutPage() {
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
          <span style={sectionLabel}>О нас</span>
          <h1
            style={{
              fontFamily: fonts.display,
              color: colors.earth100,
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(2rem,4vw,3.2rem)',
            }}
          >
            Гиды, которые живут
            <br />
            на краю света
          </h1>
        </div>
      </div>

      <section style={{ padding: '64px 24px', background: colors.earth200 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 40,
              marginBottom: 56,
            }}
          >
            {/* Ivan */}
            <div>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 4,
                  background: 'rgba(13,31,53,0.1)',
                  marginBottom: 24,
                  overflow: 'hidden',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/portrait_ivan.jpg"
                  alt="Иван Богатый — гид в Ушуайе"
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <h2
                style={{
                  fontFamily: fonts.display,
                  color: colors.ocean800,
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  marginBottom: 4,
                }}
              >
                Иван Богатый
              </h2>
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: colors.terra500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                Гид &middot; основатель
              </p>
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: '#5c5040',
                  lineHeight: 1.6,
                }}
              >
                Переехал в Ушуайю в 2018 году. За эти годы провёл более 2000
                экскурсий — от тихих прогулок по нацпарку до многодневных
                маршрутов по Патагонии. Специализация: морские экскурсии,
                пингвины и экспедиционные поездки.
              </p>
            </div>

            {/* Vicky */}
            <div>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 4,
                  background: 'rgba(13,31,53,0.1)',
                  marginBottom: 24,
                  overflow: 'hidden',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/portrait_vicky.jpg"
                  alt="Виктория Богатая — гид в Ушуайе"
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <h2
                style={{
                  fontFamily: fonts.display,
                  color: colors.ocean800,
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  marginBottom: 4,
                }}
              >
                Виктория Богатая
              </h2>
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: colors.terra500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                Гид &middot; городские экскурсии
              </p>
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: '#5c5040',
                  lineHeight: 1.6,
                }}
              >
                Проводит городские экскурсии по Ушуайе: историческая тюрьма,
                маяк, музей Финистерра. Знает каждый ресторан, каждую смотровую
                и все секреты города. Помогает с отелями, логистикой и первым
                днём после перелёта.
              </p>
            </div>
          </div>

          {/* Why Magellania */}
          <div
            style={{
              background: colors.earth100,
              borderRadius: 4,
              padding: 32,
              border: '1px solid rgba(13,31,53,0.08)',
            }}
          >
            <h2
              style={{
                fontFamily: fonts.display,
                color: colors.ocean800,
                fontSize: '1.5rem',
                fontWeight: 400,
                marginBottom: 16,
              }}
            >
              Почему Magellania
            </h2>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              {whyItems.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'baseline',
                    fontFamily: fonts.body,
                    fontSize: 14,
                    color: '#5c5040',
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      color: colors.terra500,
                      flexShrink: 0,
                      fontWeight: 700,
                    }}
                  >
                    &mdash;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
