'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { content } from '@/lib/content';

export default function Hero() {
  const C = content.hero;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const smallShadow = '0 1px 8px rgba(6,14,24,0.7)';

  const DesktopStats = () => (
    <div style={{
      position: 'absolute', right: 'clamp(20px, 5vw, 80px)', bottom: 'clamp(48px, 8vh, 80px)',
      zIndex: 2, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end',
    }}>
      {C.stats.map((s: any) => (
        <div key={s.num} style={{ textAlign: 'right' }}>
          <span style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 'clamp(24px,3vw,32px)', fontWeight: 300,
            color: '#f8f5f0', lineHeight: 1, display: 'block',
            textShadow: '0 1px 12px rgba(6,14,24,0.5)',
          }}>{s.num}</span>
          <span style={{
            fontFamily: "'Lora',Georgia,serif", fontSize: 10, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(248,245,240,0.75)',
            textShadow: smallShadow,
          }}>{s.label}</span>
        </div>
      ))}
    </div>
  );

  const MobileStats = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px 16px', marginTop: 32 }}>
      {C.stats.map((s: any) => (
        <div key={s.num}>
          <span style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 28, fontWeight: 400,
            color: '#f8f5f0', lineHeight: 1, display: 'block',
            textShadow: '0 1px 10px rgba(6,14,24,0.4)',
          }}>{s.num}</span>
          <span style={{
            fontFamily: "'Lora',Georgia,serif", fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(248,245,240,0.75)',
            textShadow: smallShadow,
          }}>{s.label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <section style={{
      position: 'relative', width: '100%', minHeight: '100svh', maxHeight: 920,
      display: 'flex', alignItems: 'flex-end',
      paddingBottom: 'clamp(48px, 8vh, 88px)', overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: (C.bg ? C.bg.replace(/url\(['"]?Boats on Water\.jpg['"]?\)/, "url('/img/boats-on-water.jpg')") : 'radial-gradient(ellipse at 30% 60%, #2e4d74 0%, transparent 55%), radial-gradient(ellipse at 75% 25%, #6aaab4 0%, transparent 45%), linear-gradient(175deg, #060e18 0%, #1a2e4a 40%, #2e4d74 70%, #4a6d96 100%)'),
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      {/* Mountain silhouette */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
        clipPath: 'polygon(0 100%, 0 60%, 8% 40%, 15% 55%, 22% 28%, 30% 48%, 38% 18%, 47% 42%, 55% 25%, 62% 45%, 70% 20%, 78% 38%, 85% 15%, 92% 35%, 100% 22%, 100% 100%)',
        background: 'linear-gradient(to top, rgba(6,14,24,0.7) 0%, transparent 100%)',
      }} />
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: C.overlay || 'linear-gradient(to top, rgba(6,14,24,0.82) 0%, rgba(13,31,53,0.4) 50%, rgba(13,31,53,0.1) 100%)' }} />

      {/* Eyebrow */}
      <span style={{
        position: 'absolute',
        top: isMobile ? 'calc(64px + 20px)' : 'calc(64px + 28px)',
        left: 0, right: 0,
        padding: '0 clamp(20px, 6vw, 80px)',
        zIndex: 2,
        fontFamily: "'Lora',Georgia,serif",
        fontSize: 13, fontWeight: 600,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'rgba(248,245,240,0.75)',
        textShadow: '0 1px 8px rgba(28, 32, 37, 0.5)',
      }}>
        {C.eyebrow}
      </span>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '0 clamp(20px, 6vw, 80px)', maxWidth: isMobile ? '100%' : 900, width: '100%',
      }}>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(2.6rem, 8vw, 4.5rem)',
          fontWeight: 400, lineHeight: 1.08,
          letterSpacing: '-0.02em', fontStyle: 'italic',
          color: '#f8f5f0', marginBottom: 24,
          textShadow: '0 2px 24px rgba(6,14,24,0.45)',
        }}>
          {C.heading.map((line: string, i: number) => (
            <Fragment key={i}>{line}{i < C.heading.length - 1 && <br />}</Fragment>
          ))}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 'clamp(14px, 1.6vw, 17px)', lineHeight: 1.75,
          color: 'rgba(248,245,240,0.92)',
          marginBottom: 36,
          maxWidth: isMobile ? '100%' : 480,
          textShadow: smallShadow,
        }}>
          {C.sub}
        </p>

        {/* CTA buttons */}
        <div style={{
          display: 'flex', gap: isMobile ? 10 : 12, alignItems: 'stretch',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <Link href="/#tours" style={{
            fontFamily: "'Lora',Georgia,serif", fontSize: 12, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '13px 28px', borderRadius: 2, border: 'none', cursor: 'pointer',
            background: '#c4703f', color: '#f8f5f0',
            width: isMobile ? '100%' : 'auto', minHeight: 48,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {C.cta1}
          </Link>
          <Link href="/#contact" style={{
            fontFamily: "'Lora',Georgia,serif", fontSize: 12, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '13px 28px', borderRadius: 2, cursor: 'pointer',
            background: 'transparent', color: '#f8f5f0',
            border: '1px solid rgba(248,245,240,0.55)',
            width: isMobile ? '100%' : 'auto', minHeight: 48,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {C.cta2}
          </Link>
        </div>

        {isMobile && <MobileStats />}
      </div>

      {!isMobile && <DesktopStats />}

      {/* Scroll hint */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(248,245,240,0.6), transparent)' }} />
        <span style={{
          fontFamily: "'Lora',serif", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'rgba(248,245,240,0.6)',
          textShadow: smallShadow,
        }}>scroll</span>
      </div>
    </section>
  );
}
