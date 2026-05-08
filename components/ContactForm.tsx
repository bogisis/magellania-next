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

  return (
    <section style={sectionStyle} data-screen-label="Contact Section">
      <div>
        <span style={eyebrow}>{C.eyebrow}</span>
        <h2 style={heading}>{C.heading}</h2>
        <p style={body}>{C.sub}</p>
        {C.contacts.map((c: any) => (
          <div key={c.label} style={contactItem}>
            <div style={iconBox}>{phoneIcon}</div>
            <div><span style={cLabel}>{c.label}</span><span style={cVal}>{c.value}</span></div>
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
