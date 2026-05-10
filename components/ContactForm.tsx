'use client';

import { useState, useEffect } from 'react';
import { content } from '@/lib/content';

export default function ContactForm() {
  const C = content.contact;
  const TOURS = content.tours;

  const [form, setForm] = useState({ name:'', contact:'', tour:'', date:'', message:'' });
  const [sent, setSent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const sectionStyle: React.CSSProperties = {
    background:'#0d1f35',
    padding:'clamp(64px, 10vw, 100px) clamp(20px, 6vw, 80px)',
    display:'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? 48 : 'clamp(40px, 6vw, 80px)',
  };

  const eyebrow: React.CSSProperties  = { fontFamily:"'Lora',serif", fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#c4703f', display:'block', marginBottom:16 };
  const heading: React.CSSProperties  = { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(1.8rem, 3vw, 2.5rem)', fontWeight:300, lineHeight:1.15, color:'#f8f5f0', marginBottom:24 };
  const body: React.CSSProperties     = { fontFamily:"'Lora',serif", fontSize:'clamp(13px, 1.5vw, 14px)', lineHeight:1.8, color:'#a8bfcf', marginBottom:32 };

  const contactItem: React.CSSProperties = { display:'flex', alignItems:'flex-start', gap:12, marginBottom:16 };
  const iconBox: React.CSSProperties     = { width:32, height:32, borderRadius:2, background:'rgba(248,245,240,0.07)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 };
  const cLabel: React.CSSProperties      = { fontFamily:"'Lora',serif", fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#7a9bb8', display:'block', marginBottom:2 };
  const cVal: React.CSSProperties        = { fontFamily:"'Lora',serif", fontSize:'clamp(12px, 1.4vw, 14px)', color:'#f8f5f0' };

  const fLabel: React.CSSProperties  = { display:'block', fontFamily:"'Lora',serif", fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#7a9bb8', marginBottom:6 };
  const fInput: React.CSSProperties  = { width:'100%', fontFamily:"'Lora',Georgia,serif", fontSize:14, color:'#f8f5f0', background:'rgba(248,245,240,0.07)', border:'1px solid rgba(248,245,240,0.15)', borderRadius:2, padding:'10px 14px', marginBottom:14, outline:'none' };
  const submitBtn: React.CSSProperties = { width:'100%', fontFamily:"'Lora',Georgia,serif", fontSize:13, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', padding:14, borderRadius:2, border:'none', cursor:'pointer', background:'#c4703f', color:'#f8f5f0', marginTop:4 };

  const phoneIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8bfcf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.31z"/>
    </svg>
  );
  const whatsappIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
  const telegramIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#26A5E4">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
  const emailIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8bfcf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );

  return (
    <section style={sectionStyle} data-screen-label="Contact Section">
      <div>
        <span style={eyebrow}>{C.eyebrow}</span>
        <h2 style={heading}>{C.heading}</h2>
        <p style={body}>{C.sub}</p>
        {C.contacts.map((c: any) => (
          <div key={c.label} style={contactItem}>
            <div style={iconBox}>
              {c.label === 'WhatsApp' ? whatsappIcon : c.label === 'Telegram' ? telegramIcon : c.label === 'Email' ? emailIcon : phoneIcon}
            </div>
            <div>
              <span style={cLabel}>{c.label}</span>
              {c.href ? (
                <a href={c.href} target={c.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" style={{ ...cVal, textDecoration: 'none', borderBottom: '1px solid rgba(248,245,240,0.2)', paddingBottom: 1 }}>{c.value}</a>
              ) : (
                <span style={cVal}>{c.value}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div>
        {sent ? (
          <div style={{ background:'rgba(248,245,240,0.07)', borderRadius:4, border:'1px solid rgba(248,245,240,0.15)', padding:'40px 32px', textAlign:'center' }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#f8f5f0', marginBottom:12 }}>{C.success.heading}</div>
            <div style={{ fontFamily:"'Lora',serif", fontSize:14, color:'#a8bfcf', lineHeight:1.7 }}>{C.success.text}</div>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'0 14px' }}>
              {C.form.fields.slice(0, 2).map((f: any) => (
                <div key={f.key}>
                  <label style={fLabel}>{f.label}</label>
                  <input style={fInput} type={f.type} placeholder={f.placeholder}
                    value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>
            <label style={fLabel}>{C.form.tourSelectLabel}</label>
            <select style={{ ...fInput, appearance:'none' }} value={form.tour} onChange={e => setForm({ ...form, tour: e.target.value })}>
              <option value="">{C.form.tourSelectDefault}</option>
              {TOURS.map((t: any) => <option key={t.id} value={t.slug}>{t.title}</option>)}
              <option value="custom">{C.form.tourSelectCustom}</option>
            </select>
            {C.form.fields.slice(2).map((f: any) => (
              <div key={f.key}>
                <label style={fLabel}>{f.label}</label>
                {f.type === 'textarea'
                  ? <textarea style={{ ...fInput, resize:'vertical', minHeight:80 }} placeholder={f.placeholder}
                      value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  : <input style={fInput} type={f.type} placeholder={f.placeholder}
                      value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                }
              </div>
            ))}
            <button type="submit" style={submitBtn}>{C.form.submitLabel}</button>
            <div style={{ fontFamily:"'Lora',serif", fontSize:11, color:'rgba(248,245,240,0.35)', textAlign:'center', marginTop:10, fontStyle:'italic' }}>{C.form.freeNote}</div>
          </form>
        )}
      </div>
    </section>
  );
}
