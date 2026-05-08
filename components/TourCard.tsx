'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { getTourVariants, getTourMinPrice, rowNote } from '@/lib/pricing';
import type { Tour } from '@/types';

interface TourCardProps {
  tour: Tour;
  onSelect: (tour: Tour) => void;
  onVariantPick: (tour: Tour) => void;
}

export default function TourCard({ tour, onSelect, onVariantPick }: TourCardProps) {
  const { priceMap, toggleSingleCart, cartCountForTour } = useCart();
  const [hovered, setHovered] = useState(false);
  const variants = getTourVariants(tour);
  const isMulti = variants.length > 1;
  const cartCount = cartCountForTour(tour.id);
  const inCart = cartCount > 0;
  // Has ticket pricing — needs popup for quantity selection
  const hasTickets = variants.some(k => priceMap[k]?.pricingType === 'tickets');

  const handleCartBtn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMulti) {
      onVariantPick && onVariantPick(tour); // opens multi-select
    } else if (hasTickets) {
      onSelect && onSelect(tour); // opens tour popup with ticket counter
    } else {
      toggleSingleCart(tour, variants[0] || null);
    }
  };

  const metaTags = [tour.duration, tour.transport, tour.maxGroup].filter(Boolean);

  // Get min note text
  const getTourMinNote = (t: Tour): string => {
    if (variants.length > 1) return `${variants.length} вар.`;
    if (variants.length === 1) {
      const row = priceMap[variants[0]];
      return row ? rowNote(row) : t.priceNote || '';
    }
    return t.priceNote || '';
  };

  // Gallery image for card
  const galleryFile =
    tour.gallery && tour.gallery[0]
      ? typeof tour.gallery[0] === 'string'
        ? tour.gallery[0]
        : tour.gallery[0].file
      : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect && onSelect(tour)}
      style={{
        background: '#f8f5f0',
        borderRadius: 4,
        border: inCart ? '2px solid #c4703f' : '1px solid rgba(13,31,53,0.10)',
        boxShadow: hovered
          ? '0 8px 32px rgba(13,31,53,0.13)'
          : '0 2px 16px rgba(13,31,53,0.07)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Photo */}
      <div
        style={{
          height: 160,
          background: galleryFile
            ? `url('/img/tours/${galleryFile}') center/cover no-repeat`
            : tour.bg,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              tour.overlay ||
              'linear-gradient(to top, rgba(13,31,53,0.65) 0%, transparent 55%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(13,31,53,0.75)',
            color: '#f8f5f0',
            fontFamily: "'Lora',serif",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '3px 9px',
            borderRadius: 2,
          }}
        >
          {tour.category}
        </div>
        {tour.season && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(13,31,53,0.55)',
              color: 'rgba(248,245,240,0.8)',
              fontFamily: "'Lora',serif",
              fontSize: 9,
              letterSpacing: '0.08em',
              padding: '3px 8px',
              borderRadius: 2,
            }}
          >
            {tour.season}
          </div>
        )}
        {isMulti && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 12,
              background: 'rgba(196,112,63,0.85)',
              color: '#f8f5f0',
              fontFamily: "'Lora',serif",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.06em',
              padding: '2px 8px',
              borderRadius: 2,
            }}
          >
            {variants.length} варианта
          </div>
        )}
        {tour.childrenOk && !isMulti && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 12,
              background: 'rgba(13,31,53,0.6)',
              color: 'rgba(248,245,240,0.8)',
              fontFamily: "'Lora',serif",
              fontSize: 9,
              letterSpacing: '0.06em',
              padding: '2px 7px',
              borderRadius: 2,
            }}
          >
            👶 С детьми
          </div>
        )}
        {inCart && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              background: '#c4703f',
              borderRadius: '50%',
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#f8f5f0',
            }}
          >
            ✓
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: '16px 16px 14px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3
          style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 20,
            fontWeight: 400,
            lineHeight: 1.15,
            color: '#0d1f35',
            marginBottom: 8,
          }}
        >
          {tour.title}
        </h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {metaTags.map(m => (
            <span
              key={m}
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 10,
                color: '#7d6e5a',
                background: 'rgba(13,31,53,0.05)',
                padding: '2px 8px',
                borderRadius: 2,
                border: '1px solid rgba(13,31,53,0.08)',
              }}
            >
              {m}
            </span>
          ))}
          {tour.language && (
            <span
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 10,
                color: '#7d6e5a',
                background: 'rgba(13,31,53,0.05)',
                padding: '2px 8px',
                borderRadius: 2,
                border: '1px solid rgba(13,31,53,0.08)',
              }}
            >
              🌍 {tour.language}
            </span>
          )}
        </div>
        <p
          style={{
            fontFamily: "'Lora',serif",
            fontSize: 12,
            lineHeight: 1.65,
            color: '#5c5040',
            flex: 1,
            marginBottom: 14,
          }}
        >
          {tour.desc}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: '1px solid rgba(13,31,53,0.08)',
            marginTop: 'auto',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: 22,
                fontWeight: 500,
                color: '#0d1f35',
                lineHeight: 1,
              }}
            >
              {getTourMinPrice(tour, priceMap)}
            </div>
            <div
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 10,
                color: '#9e8e76',
                marginTop: 2,
              }}
            >
              {getTourMinNote(tour)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={handleCartBtn}
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '5px 12px',
                borderRadius: 2,
                cursor: 'pointer',
                border: inCart ? 'none' : '1px solid rgba(196,112,63,0.5)',
                background: inCart ? '#c4703f' : 'transparent',
                color: inCart ? '#f8f5f0' : '#c4703f',
                transition: 'all 180ms',
                whiteSpace: 'nowrap',
              }}
            >
              {inCart
                ? isMulti
                  ? `✓ В туре (${cartCount})`
                  : '✓ В туре'
                : '+ Заказать'}
            </button>
            <Link
              href={`/tours/${tour.slug}/`}
              onClick={(e) => e.stopPropagation()}
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#c4703f',
                borderBottom: '1px solid currentColor',
                paddingBottom: 1,
                textDecoration: 'none',
              }}
            >
              Подробнее →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
