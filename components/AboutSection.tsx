'use client';

import { useState, useEffect } from 'react';
import { content } from '@/lib/content';

export default function AboutSection() {
  const C = content.about;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const sectionStyle: React.CSSProperties = {
    background: '#0d1f35',
    padding: 'clamp(64px, 10vw, 100px) clamp(20px, 6vw, 80px)',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? 48 : 'clamp(40px, 6vw, 80px)',
    alignItems: 'center',
  };

  const eyebrow: React.CSSProperties    = { fontFamily:"'Lora',serif", fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#c4703f', display:'block', marginBottom:16 };
  const heading: React.CSSProperties    = { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight:300, lineHeight:1.15, color:'#f8f5f0', marginBottom:24 };
  const body: React.CSSProperties       = { fontFamily:"'Lora',serif", fontSize:'clamp(13px, 1.5vw, 15px)', lineHeight:1.8, color:'#a8bfcf', marginBottom:20 };
  const quoteStyle: React.CSSProperties = { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(17px, 2.2vw, 22px)', fontWeight:300, fontStyle:'italic', color:'#f8f5f0', lineHeight:1.5, borderLeft:'2px solid #c4703f', paddingLeft:20, marginTop:32 };

  const portraitsStyle: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 };
  const portraitStyle  = (bg: string): React.CSSProperties => ({ height: isMobile ? 160 : 220, borderRadius:4, background:bg, position:'relative', border:'1px solid rgba(248,245,240,0.08)' });
  const portraitLabel  = (overlay?: string): React.CSSProperties => ({ position:'absolute', bottom:0, left:0, right:0, padding:'10px 14px', background: overlay || 'linear-gradient(to top, rgba(6,14,24,0.82) 0%, rgba(6,14,24,0.18) 48%, transparent 72%)' });
  const portName: React.CSSProperties       = { fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:400, color:'#f8f5f0', display:'block' };
  const portRole: React.CSSProperties       = { fontFamily:"'Lora',serif", fontSize:10, color:'rgba(248,245,240,0.6)', letterSpacing:'0.1em', textTransform:'uppercase' };

  const statsGrid: React.CSSProperties = { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 };
  const statBox: React.CSSProperties   = { padding:'16px 12px', borderRadius:4, border:'1px solid rgba(248,245,240,0.1)', background:'rgba(255,255,255,0.04)' };
  const statN: React.CSSProperties     = { fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(22px, 3vw, 28px)', fontWeight:300, color:'#f8f5f0', lineHeight:1, display:'block' };
  const statL: React.CSSProperties     = { fontFamily:"'Lora',serif", fontSize:10, color:'#7a9bb8', letterSpacing:'0.06em', textTransform:'uppercase', marginTop:4, display:'block' };

  return (
    <section style={sectionStyle} data-screen-label="About Section">
      <div>
        <span style={eyebrow}>{C.eyebrow}</span>
        <h2 style={heading}>{C.heading}</h2>
        <p style={body}>{C.p1}</p>
        <p style={body}>{C.p2}</p>
        <blockquote style={quoteStyle}>{C.quote}</blockquote>
      </div>
      <div>
        <div style={portraitsStyle}>
          {C.team?.map((person: any) => (
            <div key={person.name} style={portraitStyle(person.bg)}>
              <div style={portraitLabel(person.overlay)}>
                <span style={portName}>{person.name}</span>
                <span style={portRole}>{person.role}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={statsGrid}>
          {C.stats?.map((s: any) => (
            <div key={s.num} style={statBox}>
              <span style={statN}>{s.num}</span>
              <span style={statL}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
