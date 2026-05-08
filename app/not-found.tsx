import Link from 'next/link';
import { colors, fonts } from '@/lib/brand';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.ocean800,
        color: colors.earth100,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(4rem, 10vw, 8rem)',
            fontWeight: 300,
            color: colors.terra500,
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          404
        </div>
        <h1
          style={{
            fontFamily: fonts.display,
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(1.5rem, 3vw, 2.4rem)',
            marginBottom: 16,
          }}
        >
          Страница не найдена
        </h1>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: 'rgba(248,245,240,0.6)',
            lineHeight: 1.6,
            marginBottom: 32,
            maxWidth: 400,
          }}
        >
          Возможно, страница была перемещена или больше не существует.
          Вернитесь на главную или выберите маршрут.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              fontFamily: fonts.body,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '14px 28px',
              background: colors.terra500,
              color: colors.earth100,
              borderRadius: 2,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            На главную
          </Link>
          <Link
            href="/tours/"
            style={{
              fontFamily: fonts.body,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '14px 28px',
              border: '1px solid rgba(248,245,240,0.3)',
              color: colors.earth100,
              borderRadius: 2,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Экскурсии
          </Link>
        </div>
      </div>
    </main>
  );
}
