import type { Metadata } from 'next';
import { colors, fonts } from '@/lib/brand';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'Контакты | Magellania Travel — Ушуайя',
  description:
    'Связаться с русскоязычным гидом в Ушуайе: WhatsApp, email или форма на сайте. Отвечаем за 2–4 часа. Бесплатная консультация по маршруту и ценам на экскурсии.',
  openGraph: {
    title: 'Контакты | Magellania Travel',
    description:
      'Связаться с русскоязычным гидом в Ушуайе. Бесплатная консультация.',
  },
  alternates: { canonical: 'https://magellania.net/contact/' },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Magellania Travel',
  url: 'https://magellania.net',
  telephone: '+54 9 2901',
  email: 'info@magellania.net',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ushuaia',
    addressRegion: 'Tierra del Fuego',
    addressCountry: 'AR',
  },
  availableLanguage: ['Russian', 'Spanish', 'English'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'reservations',
    availableLanguage: ['Russian', 'Spanish', 'English'],
  },
};

const contacts = [
  { label: 'WhatsApp', value: '+54 9 2901 ··· ···', icon: 'W' },
  { label: 'Email', value: 'info@magellania.net', icon: '@' },
  { label: 'Telegram', value: '@magellania', icon: 'T' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: fonts.body,
  fontSize: 14,
  color: colors.ocean800,
  background: '#fff',
  border: '1px solid rgba(13,31,53,0.15)',
  borderRadius: 2,
  padding: '10px 12px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#9e8e76',
  display: 'block',
  marginBottom: 6,
};

export default function ContactPage() {
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
            Контакты
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
            Напишите нам
          </h1>
        </div>
      </div>

      <section style={{ padding: '64px 24px', background: colors.earth200 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: '#5c5040',
              lineHeight: 1.7,
              marginBottom: 40,
            }}
          >
            Напишите нам — расскажем что посмотреть, когда лучше ехать и составим
            маршрут под ваши даты. Отвечаем в WhatsApp или email в течение
            нескольких часов.
          </p>

          {/* Contact cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
              marginBottom: 48,
            }}
          >
            {contacts.map((c) => (
              <div
                key={c.label}
                style={{
                  background: colors.earth100,
                  borderRadius: 4,
                  border: '1px solid rgba(13,31,53,0.08)',
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    marginBottom: 8,
                    color: colors.terra500,
                    fontWeight: 700,
                  }}
                >
                  {c.icon}
                </div>
                <div
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9e8e76',
                    marginBottom: 4,
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    fontFamily: fonts.display,
                    color: colors.ocean800,
                    fontSize: 16,
                  }}
                >
                  {c.value}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form
            style={{
              background: colors.earth100,
              borderRadius: 4,
              border: '1px solid rgba(13,31,53,0.08)',
              padding: 32,
            }}
            action="mailto:info@magellania.net"
            method="get"
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={labelStyle}>Имя</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Как вас зовут?"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp / Email</label>
                <input
                  name="contact"
                  type="text"
                  required
                  placeholder="+7 ··· или email"
                  style={inputStyle}
                />
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={labelStyle}>Дата прилёта</label>
                <input
                  name="arrival"
                  type="text"
                  placeholder="Примерно когда"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Сколько человек</label>
                <input
                  name="group"
                  type="text"
                  placeholder="Сколько вас будет"
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Что интересует</label>
              <textarea
                name="comment"
                rows={4}
                placeholder="Расскажите что хотите увидеть, какие есть вопросы..."
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                fontFamily: fonts.body,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '16px 0',
                background: colors.ocean800,
                color: colors.earth100,
                borderRadius: 2,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Отправить запрос &rarr;
            </button>
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                color: '#9e8e76',
                textAlign: 'center',
                fontStyle: 'italic',
                marginTop: 12,
              }}
            >
              Ответим в WhatsApp или email в течение нескольких часов
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
