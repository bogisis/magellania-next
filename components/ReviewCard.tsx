interface Review {
  name: string;
  text: string;
  rating?: number;
  location?: string;
  experience?: string;
  date?: string;
  tour?: string;
  tourShort?: string;
}

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const rating = review.rating || 5;
  const subtitleParts = [review.location, review.experience].filter(Boolean);
  if (review.date) subtitleParts.push(review.date);
  const subtitle = subtitleParts.join(' · ');
  const badge = review.tourShort || review.tour;

  return (
    <div style={{ position:'relative', display:'flex', flexDirection:'column', height:'100%', background:'#f8f5f0', borderRadius:4, border:'1px solid rgba(13,31,53,0.08)', boxShadow:'0 2px 16px rgba(13,31,53,0.07)', padding:'48px 28px 24px', overflow:'hidden' }}>
      <span aria-hidden="true" style={{ position:'absolute', top:-8, left:12, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'7rem', color:'rgba(196,112,63,0.2)', lineHeight:1, userSelect:'none', pointerEvents:'none' }}>&laquo;</span>
      <div style={{ display:'flex', gap:2, marginBottom:12, position:'relative' }}>
        {Array.from({length: rating}).map((_, i) => <span key={i} style={{ color:'#c4703f', fontSize:13, lineHeight:1 }}>{'★'}</span>)}
      </div>
      <p style={{ fontFamily:"'Lora',Georgia,serif", fontSize:14, lineHeight:1.75, fontStyle:'italic', color:'#3a3228', marginBottom:24, position:'relative', flex:1 }}>{review.text}</p>
      <hr style={{ border:0, borderTop:'1px solid rgba(13,31,53,0.1)', marginBottom:16 }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:8 }}>
        <div style={{ minWidth:0 }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, fontWeight:500, color:'#0d1f35', display:'block', lineHeight:1.2 }}>{review.name}</span>
          {subtitle && <span style={{ fontFamily:"'Lora',serif", fontSize:10, color:'#9e8e76', letterSpacing:'0.06em' }}>{subtitle}</span>}
        </div>
        <span title={review.tour} style={{ fontFamily:"'Lora',serif", fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#5c5040', background:'rgba(13,31,53,0.06)', padding:'3px 8px', borderRadius:2, border:'1px solid rgba(13,31,53,0.08)', whiteSpace:'nowrap' }}>{badge}</span>
      </div>
    </div>
  );
}
