import type { Metadata } from 'next';
import SchemaOrg from '@/components/SchemaOrg';
import Hero from '@/components/Hero';
import ToursSection from '@/components/ToursSection';
import AboutSection from '@/components/AboutSection';
import ReviewsSection from '@/components/ReviewsSection';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Magellania Travel — Экскурсии в Ушуайе с русскоязычным гидом',
  description:
    '12 экскурсий в Ушуайе от $144: канал Бигля, пингвины Мартильо, нацпарк с поездом, вертолёт, каякинг. Русскоязычные гиды Иван и Виктория, группы 1–3 человека.',
  openGraph: {
    title: 'Magellania Travel — Экскурсии в Ушуайе',
    description:
      '12 экскурсий от $144. Русскоязычные гиды, малые группы, Патагония.',
  },
  alternates: { canonical: 'https://magellania.net/' },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Magellania Travel',
  description:
    'Бутиковые экскурсии по Ушуайе и Огненной Земле. Русскоязычные гиды. Малые группы.',
  url: 'https://magellania.net',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ushuaia',
    addressRegion: 'Tierra del Fuego',
    addressCountry: 'AR',
  },
  founder: { '@type': 'Person', name: 'Ivan Bogatiy' },
  areaServed: ['Ushuaia', 'Tierra del Fuego', 'Patagonia'],
  availableLanguage: ['Russian', 'Spanish', 'English'],
  priceRange: '$$',
};

export default function HomePage() {
  return (
    <main>
      <SchemaOrg schema={schema} />
      <Hero />
      <ToursSection />
      <AboutSection />
      <ReviewsSection limit={3} />
      <ContactForm />
    </main>
  );
}
