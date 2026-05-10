'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { content } from '@/lib/content';

const pageToHref: Record<string, string> = {
  home: '/',
  tours: '/#tours',
  about: '/#about',
  blog: '/blog/',
  reviews: '/#reviews',
  prices: '/#tours',
  contact: '/#contact',
  faq: '/faq/',
};

export default function Footer() {
  const C = content.footer;
  const S = content.site;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const footerStyle: React.CSSProperties = {
    background: '#060e18',
    padding: 'clamp(40px, 6vw, 60px) clamp(20px, 6vw, 80px) 32px',
    borderTop: '1px solid rgba(248,245,240,0.06)',
  };

  const topStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr',
    gap: isMobile ? '32px 20px' : 'clamp(24px, 4vw, 48px)',
    paddingBottom: 40,
    borderBottom: '1px solid rgba(248,245,240,0.08)',
    marginBottom: 28,
  };

  const logoStyle: React.CSSProperties    = { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:400, letterSpacing:'0.1em', color:'#f8f5f0', textTransform:'uppercase', fontStyle:'italic', marginBottom:14, display:'block', cursor:'pointer', textDecoration:'none' };
  const taglineStyle: React.CSSProperties = { fontFamily:"'Lora',serif", fontSize:13, lineHeight:1.7, color:'rgba(248,245,240,0.4)', fontStyle:'italic' };
  const colHeading: React.CSSProperties   = { fontFamily:"'Lora',serif", fontSize:9, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(248,245,240,0.3)', marginBottom:14, display:'block' };
  const linkStyle: React.CSSProperties    = { fontFamily:"'Lora',serif", fontSize:13, color:'rgba(248,245,240,0.55)', cursor:'pointer', display:'block', marginBottom:9, textDecoration:'none' };

  const bottomStyle: React.CSSProperties = { display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 };
  const bottomText: React.CSSProperties  = { fontFamily:"'Lora',serif", fontSize:11, color:'rgba(248,245,240,0.22)' };
  const socialRow: React.CSSProperties   = { display:'flex', gap:10 };
  const socialBtn: React.CSSProperties   = { width:32, height:32, borderRadius:2, background:'rgba(248,245,240,0.07)', border:'1px solid rgba(248,245,240,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' };

  const socialIcons = [
    <svg key="ig" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(248,245,240,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
    <svg key="tg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(248,245,240,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    <svg key="wa" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(248,245,240,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.31z"/></svg>,
  ];

  return (
    <footer style={footerStyle} data-screen-label="Footer">
      <div style={topStyle}>
        <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
          <Link href="/" style={logoStyle}>{S.name}</Link>
          <p style={taglineStyle}>{C.tagline.split('\n').map((line: string, i: number) => (
            <Fragment key={i}>{line}{i === 0 && <br />}</Fragment>
          ))}</p>
        </div>
        <div>
          <span style={colHeading}>Маршруты</span>
          {C.tourLinks.map((t: string) => <Link key={t} href="/#tours" style={linkStyle}>{t}</Link>)}
        </div>
        <div>
          <span style={colHeading}>Компания</span>
          {C.infoLinks.map((t: any) => <Link key={t.label} href={pageToHref[t.page] || '/'} style={linkStyle}>{t.label}</Link>)}
        </div>
        <div>
          <span style={colHeading}>Контакты</span>
          {C.contacts.map((t: string) => {
            const isEmail = t.includes('@');
            const isPhone = /^\+?\d[\d\s\-()]+$/.test(t.trim());
            if (isEmail) {
              return <a key={t} href={`mailto:${t}`} style={linkStyle}>{t}</a>;
            }
            if (isPhone) {
              const cleanPhone = t.replace(/[\s\-()]/g, '');
              return <a key={t} href={`https://wa.me/${cleanPhone.replace('+', '')}`} target="_blank" rel="noopener noreferrer" style={linkStyle}>{t}</a>;
            }
            return <span key={t} style={{ ...linkStyle, cursor:'default' }}>{t}</span>;
          })}
        </div>
      </div>
      <div style={bottomStyle}>
        <span style={bottomText}>{C.copyright}</span>
        <div style={socialRow}>
          {socialIcons.map((icon, i) => <div key={i} style={socialBtn}>{icon}</div>)}
        </div>
      </div>
    </footer>
  );
}
