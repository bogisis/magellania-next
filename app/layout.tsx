import type { Metadata } from 'next';
import '@/styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartWidget from '@/components/CartWidget';
import { CartProvider } from '@/lib/cart';

export const metadata: Metadata = {
  title: {
    default: 'Magellania Travel — Экскурсии в Ушуайе с русскоязычным гидом',
    template: '%s | Magellania Travel',
  },
  description: 'Бутиковые экскурсии по Ушуайе и Огненной Земле. Русскоязычные гиды, малые группы от $144.',
  metadataBase: new URL('https://magellania.net'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preload" href="/fonts/cormorant-garamond-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/lora-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartWidget />
        </CartProvider>
      </body>
    </html>
  );
}
