'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { content } from '@/lib/content';

// Anchored sections scroll on homepage; blog/tours keep separate pages for SEO
const pageToHref: Record<string, string> = {
  home: '/',
  tours: '/#tours',
  about: '/#about',
  blog: '/blog/',
  reviews: '/#reviews',
  contact: '/#contact',
};

export default function Header() {
  const C = content;
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const currentPage = (() => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/blog')) return 'blog';
    if (pathname.startsWith('/tours')) return 'tours';
    return '';
  })();

  const isHero = pathname === '/';
  const dark = isHero && !scrolled;

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    height: 64, display: 'flex', alignItems: 'center',
    padding: '0 clamp(20px, 4vw, 48px)',
    background: dark ? 'transparent' : '#f8f5f0',
    borderBottom: dark ? '1px solid rgba(248,245,240,0.15)' : '1px solid rgba(13,31,53,0.1)',
    transition: 'background 300ms, border-color 300ms',
  };

  const logoStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 22, fontWeight: 400, letterSpacing: '0.1em',
    color: dark ? '#f8f5f0' : '#0d1f35',
    textTransform: 'uppercase', fontStyle: 'italic',
    cursor: 'pointer', userSelect: 'none',
    transition: 'color 300ms', flexShrink: 0, marginRight: 'auto',
    textDecoration: 'none',
  };

  const linkStyle = (page: string): React.CSSProperties => ({
    fontFamily: "'Lora', Georgia, serif",
    fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: dark ? 'rgba(248,245,240,0.85)' : '#0d1f35',
    cursor: 'pointer', padding: '4px 0',
    borderBottom: currentPage === page
      ? `1px solid ${dark ? 'rgba(248,245,240,0.6)' : '#0d1f35'}`
      : '1px solid transparent',
    transition: 'all 200ms',
    opacity: currentPage === page ? 1 : 0.65,
    textDecoration: 'none', whiteSpace: 'nowrap',
  });

  const ctaStyle: React.CSSProperties = {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '9px 18px', borderRadius: 2, border: 'none', cursor: 'pointer',
    background: dark ? 'rgba(196,112,63,0.9)' : '#c4703f',
    color: '#f8f5f0', transition: 'background 200ms', flexShrink: 0,
    textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
  };

  const hamburgerStyle: React.CSSProperties = {
    width: 36, height: 36, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 5,
    cursor: 'pointer', background: 'none', border: 'none', padding: 4,
  };
  const barStyle: React.CSSProperties = {
    width: 22, height: 1.5, borderRadius: 1,
    background: dark ? '#f8f5f0' : '#0d1f35', transition: 'background 300ms',
  };

  const links = C.nav.links.filter((l: any) => !l.hidden);

  const mobileMenuStyle: React.CSSProperties = {
    position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
    background: '#f8f5f0',
    borderBottom: '1px solid rgba(13,31,53,0.1)',
    padding: '16px 24px 20px',
    display: menuOpen ? 'flex' : 'none',
    flexDirection: 'column', gap: 0,
    boxShadow: '0 8px 32px rgba(13,31,53,0.1)',
  };

  const mobileLinkStyle = (page: string): React.CSSProperties => ({
    fontFamily: "'Lora', Georgia, serif",
    fontSize: 14, fontWeight: currentPage === page ? 600 : 400,
    letterSpacing: '0.06em', textTransform: 'uppercase',
    color: currentPage === page ? '#0d1f35' : 'rgba(13,31,53,0.6)',
    cursor: 'pointer', padding: '12px 0',
    borderBottom: '1px solid rgba(13,31,53,0.07)',
    textDecoration: 'none',
    display: 'block',
  });

  return (
    <>
      <header style={navStyle}>
        <Link href="/" style={logoStyle}>
          Magellania
        </Link>

        {!isMobile && (
          <nav style={{ display: 'flex', gap: 'clamp(16px, 2.5vw, 28px)', alignItems: 'center', marginLeft: 32, marginRight: 24 }}>
            {links.map(({ label, page }: { label: string; page: string }) => (
              <Link key={page} href={pageToHref[page] || '/'} style={linkStyle(page)}>{label}</Link>
            ))}
          </nav>
        )}

        {!isMobile && (
          <Link href="/#contact" style={ctaStyle}>
            {C.nav.cta}
          </Link>
        )}

        {isMobile && (
          <button style={hamburgerStyle} onClick={() => setMenuOpen(!menuOpen)}>
            <div style={barStyle}></div>
            <div style={barStyle}></div>
            <div style={barStyle}></div>
          </button>
        )}
      </header>

      {isMobile && (
        <div style={mobileMenuStyle}>
          {links.map(({ label, page }: { label: string; page: string }) => (
            <Link key={page} href={pageToHref[page] || '/'} style={mobileLinkStyle(page)} onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
          <Link href="/#contact" style={{ ...ctaStyle, marginTop: 16, width: '100%', padding: '12px', textAlign: 'center', justifyContent: 'center' } as React.CSSProperties}
            onClick={() => setMenuOpen(false)}>
            {C.nav.cta}
          </Link>
        </div>
      )}
    </>
  );
}
