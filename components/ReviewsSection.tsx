import Link from 'next/link';
import { content } from '@/lib/content';
import ReviewCard from './ReviewCard';

function pluralReviews(n: number): string {
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return 'отзывов';
  const m10 = n % 10;
  if (m10 === 1) return 'отзыв';
  if (m10 >= 2 && m10 <= 4) return 'отзыва';
  return 'отзывов';
}

interface ReviewsSectionProps {
  limit?: number;
}

export default function ReviewsSection({ limit }: ReviewsSectionProps) {
  const C = content.reviews;
  const isPreview = typeof limit === 'number';
  const items = isPreview ? C.items.slice(0, limit) : C.items;
  const agg = C.aggregate || { rating: 5, count: C.items.length, avgGroupSize: 2 };

  const sectionStyle: React.CSSProperties = { background:'#f2ece2', padding:'clamp(64px, 10vw, 100px) clamp(20px, 6vw, 80px)' };
  const eyebrow: React.CSSProperties = { fontFamily:"'Lora',serif", fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#c4703f', display:'block', marginBottom:12 };
  const heading: React.CSSProperties = { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(2rem, 3.5vw, 2.8rem)', fontWeight:300, lineHeight:1.1, color:'#0d1f35', marginBottom: C.lead ? 16 : 40 };
  const lead: React.CSSProperties = { fontFamily:"'Lora',serif", fontSize:15, lineHeight:1.7, color:'#5c5040', maxWidth:640, marginBottom:40 };
  const grid: React.CSSProperties = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16, alignItems:'stretch' };

  const ctaWrap: React.CSSProperties = { textAlign:'center', marginTop:40 };
  const ctaBtn: React.CSSProperties = { display:'inline-block', fontFamily:"'Lora',Georgia,serif", fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', padding:'14px 32px', border:'1px solid rgba(13,31,53,0.3)', color:'#0d1f35', borderRadius:2, background:'transparent', cursor:'pointer', textDecoration:'none' };

  const aggStyle: React.CSSProperties = {
    display:'flex', flexWrap:'wrap', gap:'24px 48px', alignItems:'center', justifyContent:'center', textAlign:'center',
    background:'#f8f5f0', borderRadius:4, border:'1px solid rgba(13,31,53,0.08)', padding:'28px 24px', marginBottom:40
  };
  const aggNum: React.CSSProperties = { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(2rem, 3.5vw, 2.8rem)', fontWeight:300, color:'#0d1f35', lineHeight:1, marginBottom:6 };
  const aggLbl: React.CSSProperties = { fontFamily:"'Lora',serif", fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#9e8e76' };

  return (
    <section style={sectionStyle} data-screen-label="Reviews Section">
      <span style={eyebrow}>{C.eyebrow}</span>
      <h2 style={heading}>{C.heading}</h2>
      {C.lead && !isPreview && <p style={lead}>{C.lead}</p>}

      {!isPreview && (
        <div style={aggStyle}>
          <div>
            <div style={aggNum}>{agg.rating.toFixed(1)}<span style={{ fontSize:'0.55em', color:'rgba(92,80,64,0.6)' }}> / 5</span></div>
            <div style={{ display:'flex', justifyContent:'center', gap:2, marginBottom:4 }}>
              {[1,2,3,4,5].map(i => <span key={i} style={{ color:'#c4703f', fontSize:14 }}>{'★'}</span>)}
            </div>
            <div style={aggLbl}>средний рейтинг</div>
          </div>
          <div>
            <div style={aggNum}>{agg.count}</div>
            <div style={aggLbl}>{pluralReviews(agg.count)} гостей</div>
          </div>
          <div>
            <div style={aggNum}>{agg.avgGroupSize}</div>
            <div style={aggLbl}>человек в группе</div>
          </div>
        </div>
      )}

      <div style={grid}>{items.map((r: any, i: number) => <ReviewCard key={i} review={r} />)}</div>

      {isPreview && (
        <div style={ctaWrap}>
          <Link href="/reviews/" style={ctaBtn}>
            Все отзывы &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}
