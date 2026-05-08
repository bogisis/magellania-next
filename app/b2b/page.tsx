import type { Metadata } from 'next';
import Link from 'next/link';
import { content } from '@/lib/content';
import SchemaOrg from '@/components/SchemaOrg';
import { colors, fonts } from '@/lib/brand';

const cards = (content.b2bCards as Record<string, any>[] | undefined) || [];

export const metadata: Metadata = {
  title: 'B2B Ground Handling Ushuaia — Magellania Travel',
  description:
    'Наземное обслуживание групп в Ушуайе: транспорт (автобус, Sprinter, 4x4), русскоязычные гиды, трансферы. Работаем с туроператорами и круизными компаниями.',
  openGraph: {
    title: 'B2B Ground Handling Ushuaia — Magellania Travel',
    description:
      'Наземное обслуживание групп в Ушуайе для туроператоров.',
  },
  alternates: { canonical: 'https://magellania.net/b2b/' },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Magellania B2B — Ground Handling Ushuaia',
  description:
    'Наземное обслуживание групп в Ушуайе: транспорт, гиды, трансферы. Работаем с туроператорами и круизными компаниями.',
  url: 'https://magellania.net/b2b',
  provider: {
    '@type': 'TravelAgency',
    name: 'Magellania Travel',
    url: 'https://magellania.net',
  },
  areaServed: { '@type': 'City', name: 'Ushuaia' },
  availableLanguage: ['Russian', 'Spanish', 'English'],
};

const faqItems = [
  {
    q: 'Какой минимальный размер группы для ground handling?',
    a: 'Работаем с группами от 1 человека. Для больших групп (от 20 чел.) предоставляем автобусы и несколько гидов одновременно.',
  },
  {
    q: 'Сколько стоит наземное обслуживание группы 100 человек в Нацпарке?',
    a: 'Нацпарк Tierra del Fuego для группы 100 человек — от $4 500. Стоимость зависит от программы и дополнительных услуг.',
  },
  {
    q: 'Работаете ли вы с круизными компаниями?',
    a: 'Да. Мы обслуживаем пассажиров круизных судов в Ушуайе: трансферы порт — отель — экскурсии — порт, наземные программы полного дня.',
  },
  {
    q: 'Какая комиссия для агентов?',
    a: 'Фиксированная комиссионная модель. Конкретный размер обсуждается индивидуально. Напишите нам для получения агентского договора.',
  },
  {
    q: 'Как организован трансфер из аэропорта Ушуайи?',
    a: 'Аэропорт <-> центр города — от $15. Встреча с табличкой, помощь с багажом, русскоязычный гид. Для групп — Sprinter или автобус.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

const stats = [
  {
    num: '2 000+',
    label: 'довольных гостей',
    desc: 'Опыт работы с русскоязычными туристами и международными группами с 2019 года.',
  },
  {
    num: '100+',
    label: 'человек в группе',
    desc: 'Организуем транспорт и несколько гидов одновременно для больших круизных групп.',
  },
  {
    num: '24/7',
    label: 'на связи',
    desc: 'Координация в реальном времени. WhatsApp, Telegram, email — отвечаем быстро.',
  },
];

export default function B2bPage() {
  return (
    <main>
      <SchemaOrg schema={[serviceSchema, faqSchema]} />

      {/* Hero */}
      <section
        style={{
          background: colors.ocean800,
          paddingTop: 112,
          paddingBottom: 64,
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
              marginBottom: 16,
            }}
          >
            Партнёрам
          </span>
          <h1
            style={{
              fontFamily: fonts.display,
              color: colors.earth100,
              fontWeight: 300,
              lineHeight: 1.15,
              fontSize: 'clamp(2.4rem,5vw,3.8rem)',
              marginBottom: 24,
            }}
          >
            B2B Ground Handling
            <br />
            <em>в Ушуайе</em>
          </h1>
          <p
            style={{
              fontFamily: fonts.body,
              color: 'rgba(248,245,240,0.65)',
              maxWidth: 640,
              lineHeight: 1.6,
              fontSize: 14,
            }}
          >
            Работаем с туроператорами, круизными компаниями и агентами. Берём на
            себя весь берег: транспорт, гиды, координация групп любого размера.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section style={{ padding: '80px 24px', background: colors.earth200 }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
              marginBottom: 64,
            }}
          >
            {cards.map((card, i) => (
              <div
                key={i}
                style={{
                  background: colors.earth100,
                  borderRadius: 4,
                  border: '1px solid rgba(13,31,53,0.1)',
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: colors.terra500,
                    display: 'block',
                    marginBottom: 12,
                  }}
                >
                  {card.sub}
                </span>
                <h2
                  style={{
                    fontFamily: fonts.display,
                    color: colors.ocean800,
                    fontSize: '1.5rem',
                    fontWeight: 400,
                    lineHeight: 1.2,
                    marginBottom: 16,
                  }}
                >
                  {card.title}
                </h2>
                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    color: '#5c5040',
                    lineHeight: 1.6,
                    flex: 1,
                    marginBottom: 20,
                  }}
                >
                  {card.desc}
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 24px',
                  }}
                >
                  {(card.items as string[]).map((item, j) => (
                    <li
                      key={j}
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 12,
                        color: '#5c5040',
                        padding: '8px 0',
                        borderBottom: '1px solid rgba(13,31,53,0.06)',
                        display: 'flex',
                        gap: 8,
                        alignItems: 'baseline',
                      }}
                    >
                      <span
                        style={{
                          color: colors.terra500,
                          flexShrink: 0,
                        }}
                      >
                        &ndash;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact/"
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '10px 20px',
                    border: `1px solid ${colors.ocean800}`,
                    color: colors.ocean800,
                    borderRadius: 2,
                    textDecoration: 'none',
                    alignSelf: 'flex-start',
                    display: 'inline-block',
                  }}
                >
                  {card.cta} &rarr;
                </Link>
              </div>
            ))}
          </div>

          {/* Why us */}
          <div
            style={{
              background: colors.ocean800,
              borderRadius: 4,
              padding: '40px 56px',
              color: colors.earth100,
            }}
          >
            <h2
              style={{
                fontFamily: fonts.display,
                fontWeight: 300,
                fontSize: '1.5rem',
                marginBottom: 32,
              }}
            >
              Почему выбирают нас
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 32,
              }}
            >
              {stats.map((s, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontFamily: fonts.display,
                      color: colors.terra500,
                      fontSize: '1.8rem',
                      fontWeight: 300,
                      marginBottom: 8,
                    }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: 'rgba(248,245,240,0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 8,
                    }}
                  >
                    {s.label}
                  </div>
                  <p
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: 'rgba(248,245,240,0.55)',
                      lineHeight: 1.6,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 24px', background: colors.earth100 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <span
            style={{
              fontFamily: fonts.body,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: colors.terra500,
              display: 'block',
              marginBottom: 16,
            }}
          >
            FAQ
          </span>
          <h2
            style={{
              fontFamily: fonts.display,
              color: colors.ocean800,
              fontWeight: 300,
              fontSize: '1.5rem',
              marginBottom: 40,
            }}
          >
            Часто задаваемые вопросы
          </h2>
          <div>
            {faqItems.map((item, i) => (
              <details
                key={i}
                style={{
                  border: '1px solid rgba(13,31,53,0.1)',
                  borderRadius: 4,
                  background: colors.earth200,
                  marginBottom: 12,
                }}
              >
                <summary
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.ocean800,
                    padding: '16px 20px',
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {item.q}
                  <span
                    style={{
                      color: colors.terra500,
                      fontWeight: 400,
                      marginLeft: 12,
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </summary>
                <div
                  style={{
                    padding: '0 20px 16px',
                    fontFamily: fonts.body,
                    fontSize: 12,
                    color: '#5c5040',
                    lineHeight: 1.6,
                  }}
                >
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '64px 24px',
          background: colors.ocean800,
          color: colors.earth100,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: fonts.display,
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(1.6rem,3vw,2.4rem)',
            marginBottom: 16,
          }}
        >
          Готовы обсудить условия?
        </h2>
        <p
          style={{
            fontFamily: fonts.body,
            color: 'rgba(248,245,240,0.6)',
            fontSize: 14,
            marginBottom: 32,
          }}
        >
          Отправьте запрос — ответим в течение нескольких часов с расчётом под
          вашу программу.
        </p>
        <Link
          href="/contact/"
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
          Отправить запрос &rarr;
        </Link>
      </section>
    </main>
  );
}
