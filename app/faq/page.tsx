import type { Metadata } from 'next';
import { content } from '@/lib/content';
import SchemaOrg from '@/components/SchemaOrg';
import { colors, fonts } from '@/lib/brand';

const generalFaqs = [
  {
    q: 'Как записаться на экскурсию?',
    a: 'Напишите нам через форму на странице «Контакты» или в WhatsApp. Уточним дату, группу и составим программу. Предоплата не требуется.',
  },
  {
    q: 'На каком языке проводятся экскурсии?',
    a: 'На русском языке. Иван и Виктория — носители русского, живут в Ушуайе с 2018 года.',
  },
  {
    q: 'Какой максимальный размер группы?',
    a: 'Частные туры — до 3 человек в личном авто. Для больших групп (4–11 человек) организуем минибас — уточняйте при бронировании.',
  },
  {
    q: 'Нужна ли предоплата?',
    a: 'Нет. Оплата производится наличными или картой в день экскурсии.',
  },
  {
    q: 'Что делать если мой рейс задерживается?',
    a: 'Мы отслеживаем рейсы и всегда на связи. Программу адаптируем под фактическое время прибытия.',
  },
  {
    q: 'Включён ли трансфер из аэропорта?',
    a: 'Трансфер из аэропорта Ушуайи входит в большинство программ или заказывается отдельно. Аэропорт находится в черте города — 10–15 минут от центра.',
  },
];

const tourFaqs = content.tours
  .filter((t) => t.faq?.length)
  .flatMap((t) =>
    t.faq.map((item) => ({ ...item, source: t.title }))
  );

const allFaqs = [...generalFaqs, ...tourFaqs];

const schema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allFaqs.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export const metadata: Metadata = {
  title: 'FAQ — Вопросы об экскурсиях в Ушуайе | Magellania',
  description:
    'Ответы на частые вопросы об экскурсиях в Ушуайе: язык гида, размер группы (до 3 человек), оплата наличными в USD, погода по месяцам, пингвины, трансфер.',
  openGraph: {
    title: 'FAQ — Вопросы об экскурсиях в Ушуайе',
    description:
      'Ответы на частые вопросы: язык, группа, оплата, погода, пингвины.',
  },
  alternates: { canonical: 'https://magellania.net/faq/' },
};

const detailsStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(13,31,53,0.08)',
  padding: '16px 0',
};

const summaryStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 14,
  fontWeight: 600,
  color: colors.ocean800,
  cursor: 'pointer',
  listStyle: 'none',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
};

const answerStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 14,
  color: '#5c5040',
  lineHeight: 1.6,
  marginTop: 12,
  maxWidth: 640,
};

export default function FaqPage() {
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
            FAQ
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
            Частые вопросы
          </h1>
        </div>
      </div>

      <section style={{ padding: '64px 24px', background: colors.earth200 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: fonts.body,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#9e8e76',
              marginBottom: 24,
            }}
          >
            Общие вопросы
          </h2>
          <div style={{ marginBottom: 48 }}>
            {generalFaqs.map((item, i) => (
              <details key={i} style={detailsStyle}>
                <summary style={summaryStyle}>
                  <span>{item.q}</span>
                  <span
                    style={{
                      color: '#9e8e76',
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {'▾'}
                  </span>
                </summary>
                <p style={answerStyle}>{item.a}</p>
              </details>
            ))}
          </div>

          <h2
            style={{
              fontFamily: fonts.body,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#9e8e76',
              marginBottom: 24,
            }}
          >
            Вопросы по турам
          </h2>
          <div>
            {tourFaqs.map((item, i) => (
              <details key={i} style={detailsStyle}>
                <summary style={summaryStyle}>
                  <span style={{ flex: 1 }}>{item.q}</span>
                  <span
                    style={{
                      color: '#9e8e76',
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {'▾'}
                  </span>
                </summary>
                <div
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 9,
                    color: colors.terra500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginTop: 4,
                  }}
                >
                  {item.source}
                </div>
                <p style={answerStyle}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
