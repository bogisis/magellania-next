'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { rowDisplayPrice, rowNote, getTourVariants } from '@/lib/pricing';
import type { Tour } from '@/types';

interface VariantPickerProps {
  tour: Tour;
  cartKeys: Set<string>;
  onApply: (selected: Set<string>) => void;
  onClose: () => void;
}

export default function VariantPicker({ tour, cartKeys, onApply, onClose }: VariantPickerProps) {
  const { priceMap } = useCart();
  const variants = getTourVariants(tour);
  const [selected, setSelected] = useState<Set<string>>(new Set(cartKeys || []));

  const toggle = (key: string) =>
    setSelected(s => {
      const next = new Set(s);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const count = selected.size;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 220,
        background: 'rgba(6,14,24,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#f8f5f0',
          borderRadius: 4,
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 16px 64px rgba(13,31,53,0.35)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 22px 14px',
            borderBottom: '1px solid rgba(13,31,53,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#c4703f',
                display: 'block',
                marginBottom: 5,
              }}
            >
              {tour.category}
            </span>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: 21,
                fontWeight: 300,
                color: '#0d1f35',
                lineHeight: 1.15,
              }}
            >
              {tour.title}
            </h3>
            <div
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 10,
                color: '#9e8e76',
                marginTop: 4,
              }}
            >
              Отметьте нужные позиции — можно несколько
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(13,31,53,0.07)',
              border: 'none',
              cursor: 'pointer',
              color: '#0d1f35',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Variants list — checkboxes */}
        <div style={{ padding: '12px 22px 6px', maxHeight: 360, overflowY: 'auto' }}>
          {variants.map(key => {
            const pd = priceMap[key];
            // If key not found in priceMap — show placeholder, don't hide
            if (!pd)
              return (
                <div
                  key={key}
                  style={{
                    padding: '8px 14px',
                    marginBottom: 6,
                    borderRadius: 4,
                    border: '1px dashed rgba(196,112,63,0.4)',
                    background: 'rgba(196,112,63,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 11,
                      color: '#c4703f',
                      flex: 1,
                    }}
                  >
                    Позиция прайса (ключ: <code style={{ fontSize: 10 }}>{key}</code>) — сохрани
                    прайс в admin и обнови страницу
                  </div>
                </div>
              );
            const isSel = selected.has(key);
            return (
              <div
                key={key}
                onClick={() => toggle(key)}
                style={{
                  padding: '11px 14px',
                  marginBottom: 8,
                  borderRadius: 4,
                  cursor: 'pointer',
                  border: isSel ? '2px solid #c4703f' : '1px solid rgba(13,31,53,0.1)',
                  background: isSel ? '#fff7ed' : '#fff',
                  transition: 'all 120ms',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 2,
                    border: isSel ? 'none' : '2px solid rgba(13,31,53,0.2)',
                    background: isSel ? '#c4703f' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 120ms',
                  }}
                >
                  {isSel && (
                    <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 13,
                      fontWeight: isSel ? 600 : 500,
                      color: '#0d1f35',
                      lineHeight: 1.35,
                    }}
                  >
                    {pd.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 10,
                      color: '#9e8e76',
                      marginTop: 2,
                    }}
                  >
                    {[pd.duration, pd.note]
                      .filter(s => s && s !== '—')
                      .join(' · ')}
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond',Georgia,serif",
                      fontSize: 19,
                      fontWeight: 500,
                      color: '#0d1f35',
                      lineHeight: 1,
                    }}
                  >
                    {rowDisplayPrice(pd)}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      color: pd.pricingType === 'person' ? '#c4703f' : '#9e8e76',
                      marginTop: 2,
                    }}
                  >
                    {rowNote(pd)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ padding: '10px 22px 20px' }}>
          <button
            onClick={() => onApply(selected)}
            style={{
              width: '100%',
              fontFamily: "'Lora',serif",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '13px',
              borderRadius: 2,
              border: 'none',
              cursor: 'pointer',
              background: count > 0 ? '#c4703f' : '#0d1f35',
              color: '#f8f5f0',
              transition: 'background 200ms',
            }}
          >
            {count > 0
              ? `+ Заказать ${count} ${count === 1 ? 'позицию' : count < 5 ? 'позиции' : 'позиций'} →`
              : 'Убрать из тура'}
          </button>
        </div>
      </div>
    </div>
  );
}
