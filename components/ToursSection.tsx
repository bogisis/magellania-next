'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { content } from '@/lib/content';
import { useCart } from '@/lib/cart';
import { getTourMinPrice } from '@/lib/pricing';
import TourCard from '@/components/TourCard';
import TourModal from '@/components/TourModal';
import VariantPicker from '@/components/VariantPicker';
import type { Tour } from '@/types';

interface ToursSectionProps {
  onNavigate?: (target: string) => void;
}

export default function ToursSection({ onNavigate }: ToursSectionProps) {
  const C = content.toursSection;
  const PC = content.preCruise as any;
  const SC = content.specialCards as any;
  const TOURS = content.tours;

  const router = useRouter();
  const { priceMap, cartKeysForTour, applyVariantSelection } = useCart();

  const [activeFilter, setActiveFilter] = useState('Все');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeAudience, setActiveAudience] = useState('b2c');
  const [preCruiseModal, setPreCruiseModal] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [variantPickerTour, setVariantPickerTour] = useState<Tour | null>(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 600 : false,
  );

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const handleNavigate = (target: string) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      router.push(`/${target}/`);
    }
  };

  const filters = C.filters;
  const filtered =
    activeFilter === 'Все' ? TOURS : TOURS.filter(t => t.category === activeFilter);

  const sectionStyle: React.CSSProperties = {
    background: '#f2ece2',
    padding: 'clamp(64px, 10vw, 100px) clamp(20px, 6vw, 80px)',
  };
  const eyebrow: React.CSSProperties = {
    fontFamily: "'Lora',serif",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#c4703f',
    display: 'block',
    marginBottom: 12,
  };
  const heading: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond',Georgia,serif",
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 300,
    lineHeight: 1.1,
    color: '#0d1f35',
    marginBottom: 16,
  };
  const sub: React.CSSProperties = {
    fontFamily: "'Lora',serif",
    fontSize: 'clamp(13px, 1.5vw, 16px)',
    lineHeight: 1.7,
    color: '#5c5040',
    maxWidth: 520,
    marginBottom: 40,
  };
  const filtersStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 32,
  };
  const filterStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Lora',serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '6px 14px',
    borderRadius: 2,
    cursor: 'pointer',
    background: active ? '#0d1f35' : 'transparent',
    color: active ? '#f8f5f0' : '#0d1f35',
    border: active ? 'none' : '1px solid rgba(13,31,53,0.22)',
    transition: 'all 180ms',
  });
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 20,
  };

  return (
    <section style={sectionStyle} data-screen-label="Tours Section">
      <span style={eyebrow}>{C.eyebrow}</span>
      <h2 style={heading}>{C.heading}</h2>
      <p style={sub}>{C.sub}</p>

      {/* Audience toggle */}
      <div
        style={{
          display: 'inline-flex',
          borderRadius: 2,
          border: '1px solid rgba(13,31,53,0.2)',
          overflow: 'hidden',
          marginBottom: 40,
        }}
      >
        {[
          { id: 'b2c', label: C.toggleB2C },
          { id: 'b2b', label: C.toggleB2B },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveAudience(id)}
            style={{
              fontFamily: "'Lora',serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '10px 24px',
              cursor: 'pointer',
              border: 'none',
              background: activeAudience === id ? '#0d1f35' : 'transparent',
              color: activeAudience === id ? '#f8f5f0' : '#0d1f35',
              transition: 'all 180ms',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeAudience === 'b2c' && (
        <>
          {/* Pre-cruise flagship + city tour */}
          {PC && (
            <div
              style={{
                display: 'flex',
                gap: 16,
                marginBottom: 32,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'stretch',
              }}
            >
              {/* Pre-cruise flagship */}
              <div
                style={{
                  background:
                    PC.bg || "url('/img/pre-cruise-hero.jpg') center 40%/cover",
                  borderRadius: 4,
                  padding: isMobile ? '24px 20px' : '32px 36px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  gap: 24,
                  border: '1px solid rgba(248,245,240,0.08)',
                  boxShadow: '0 4px 32px rgba(6,14,24,0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      PC.overlay ||
                      'linear-gradient(to right, rgba(13,31,53,0.88) 0%, rgba(13,31,53,0.6) 60%, rgba(13,31,53,0.45) 100%)',
                    zIndex: 0,
                  }}
                />
                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                  <span
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#c4703f',
                      display: 'block',
                      marginBottom: 10,
                    }}
                  >
                    {PC.eyebrow}
                  </span>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond',Georgia,serif",
                      fontSize: 'clamp(1.6rem,2.8vw,2.2rem)',
                      fontWeight: 300,
                      fontStyle: 'italic',
                      color: '#f8f5f0',
                      lineHeight: 1.15,
                      marginBottom: 12,
                    }}
                  >
                    {PC.heading}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 13,
                      lineHeight: 1.8,
                      color: 'rgba(197,216,227,0.82)',
                      maxWidth: 500,
                      marginBottom: 18,
                    }}
                  >
                    {PC.desc}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {PC.tags?.map((t: string) => (
                      <span
                        key={t}
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: 10,
                          color: 'rgba(197,216,227,0.65)',
                          background: 'rgba(248,245,240,0.07)',
                          padding: '3px 10px',
                          borderRadius: 2,
                          border: '1px solid rgba(248,245,240,0.1)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond',Georgia,serif",
                      fontSize: 'clamp(1.8rem,2.8vw,2.4rem)',
                      fontWeight: 500,
                      color: '#f8f5f0',
                      lineHeight: 1,
                    }}
                  >
                    {PC.price}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 10,
                      color: 'rgba(248,245,240,0.75)',
                      marginBottom: 16,
                    }}
                  >
                    {PC.priceNote}
                  </div>
                  <button
                    onClick={() => setPreCruiseModal(true)}
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '11px 24px',
                      borderRadius: 2,
                      border: 'none',
                      cursor: 'pointer',
                      background: '#c4703f',
                      color: '#f8f5f0',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {PC.cta}
                  </button>
                </div>
              </div>

              {/* City tour card */}
              {(() => {
                const ct = TOURS.find(t => t.id === 11);
                if (!ct) return null;
                return (
                  <div
                    onClick={() => setSelectedTour(ct)}
                    style={{
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: ct.bg || "url('/img/tours/city-tour.jpg') center/cover",
                      flexShrink: 0,
                      width: isMobile ? '100%' : 'clamp(220px, 22%, 300px)',
                      minHeight: isMobile ? 96 : undefined,
                      display: 'flex',
                      flexDirection: isMobile ? 'row' : 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      border: '1px solid rgba(248,245,240,0.08)',
                      boxShadow: '0 4px 32px rgba(6,14,24,0.2)',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: isMobile
                          ? 'linear-gradient(to right, rgba(13,31,53,0.88) 0%, rgba(13,31,53,0.5) 70%, rgba(13,31,53,0.35) 100%)'
                          : 'linear-gradient(to top, rgba(13,31,53,0.95) 0%, rgba(13,31,53,0.55) 55%, rgba(13,31,53,0.25) 100%)',
                      }}
                    />
                    {!isMobile && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(to bottom, rgba(13,31,53,0.65) 0%, transparent 45%)',
                        }}
                      />
                    )}
                    <div
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        padding: isMobile ? '16px 18px' : '20px 20px 14px',
                        flex: 1,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: '#c4703f',
                          display: 'block',
                          marginBottom: isMobile ? 4 : 8,
                        }}
                      >
                        Город
                      </span>
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond',Georgia,serif",
                          fontSize: isMobile
                            ? 18
                            : 'clamp(1.1rem,1.8vw,1.35rem)',
                          fontWeight: 300,
                          fontStyle: 'italic',
                          color: '#f8f5f0',
                          lineHeight: 1.2,
                          marginBottom: isMobile ? 0 : 8,
                        }}
                      >
                        Городская экскурсия
                      </h3>
                      {!isMobile && (
                        <p
                          style={{
                            fontFamily: "'Lora',serif",
                            fontSize: 11,
                            lineHeight: 1.65,
                            color: 'rgba(197,216,227,0.7)',
                            marginBottom: 0,
                          }}
                        >
                          Маяк, историческая тюрьма, музей, рынок.
                        </p>
                      )}
                    </div>
                    <div
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        padding: isMobile ? '16px 18px' : '0 20px 20px',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-end' : 'baseline',
                        justifyContent: isMobile ? 'flex-end' : 'space-between',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond',Georgia,serif",
                          fontSize: isMobile
                            ? 20
                            : 'clamp(1.1rem,1.6vw,1.4rem)',
                          fontWeight: 500,
                          color: '#f8f5f0',
                          lineHeight: 1,
                          display: 'block',
                          marginBottom: isMobile ? 8 : 0,
                        }}
                      >
                        {getTourMinPrice(ct, priceMap)}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'rgba(197,216,227,0.85)',
                          borderBottom: '1px solid rgba(197,216,227,0.5)',
                          paddingBottom: 1,
                        }}
                      >
                        Подробнее →
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Pre-cruise modal */}
          {preCruiseModal && PC?.modal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 200,
                background: 'rgba(6,14,24,0.78)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(16px,4vw,32px)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setPreCruiseModal(false)}
            >
              <div
                style={{
                  background: '#0d1f35',
                  borderRadius: 4,
                  maxWidth: 560,
                  width: '100%',
                  boxShadow: '0 16px 64px rgba(6,14,24,0.5)',
                  overflow: 'hidden',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
                onClick={e => e.stopPropagation()}
              >
                <div
                  style={{
                    padding: '28px 28px 20px',
                    borderBottom: '1px solid rgba(248,245,240,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#c4703f',
                        display: 'block',
                        marginBottom: 8,
                      }}
                    >
                      {PC.eyebrow}
                    </span>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond',Georgia,serif",
                        fontSize: 28,
                        fontWeight: 300,
                        fontStyle: 'italic',
                        color: '#f8f5f0',
                        lineHeight: 1.1,
                      }}
                    >
                      {PC.heading}
                    </h3>
                  </div>
                  <button
                    onClick={() => setPreCruiseModal(false)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(248,245,240,0.1)',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#f8f5f0',
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
                <div
                  style={{
                    padding: '20px 28px 24px',
                    borderBottom: '1px solid rgba(248,245,240,0.08)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 13,
                      lineHeight: 1.9,
                      color: 'rgba(197,216,227,0.82)',
                      marginBottom: 20,
                    }}
                  >
                    {PC.modal.desc1}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 13,
                      lineHeight: 1.9,
                      color: 'rgba(197,216,227,0.82)',
                      marginBottom: 20,
                    }}
                  >
                    {PC.modal.desc2}
                  </p>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(197,216,227,0.45)',
                      marginBottom: 10,
                    }}
                  >
                    {PC.modal.includesLabel}
                  </div>
                  {PC.modal.includes?.map((item: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'baseline',
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ color: '#c4703f', fontSize: 12, flexShrink: 0 }}>—</span>
                      <span
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: 12,
                          lineHeight: 1.7,
                          color: 'rgba(197,216,227,0.75)',
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(197,216,227,0.45)',
                      marginBottom: 10,
                      marginTop: 16,
                    }}
                  >
                    {PC.modal.itineraryLabel}
                  </div>
                  {PC.modal.itinerary?.map((item: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'baseline',
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ color: '#c4703f', fontSize: 12, flexShrink: 0 }}>—</span>
                      <span
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: 12,
                          lineHeight: 1.7,
                          color: 'rgba(197,216,227,0.75)',
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    padding: '16px 28px 20px',
                    borderTop: '1px solid rgba(248,245,240,0.08)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 11,
                      color: 'rgba(197,216,227,0.5)',
                      fontStyle: 'italic',
                      marginBottom: 10,
                    }}
                  >
                    {PC.modal.disclaimer}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: 12,
                        color: 'rgba(197,216,227,0.7)',
                      }}
                    >
                      {PC.modal.exampleLabel}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond',Georgia,serif",
                        fontSize: 26,
                        fontWeight: 500,
                        color: '#f8f5f0',
                      }}
                    >
                      {PC.modal.examplePrice}
                    </span>
                  </div>
                  {PC.modal.exampleNote1 && (
                    <div
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: 11,
                        color: 'rgba(197,216,227,0.38)',
                        fontStyle: 'italic',
                      }}
                    >
                      {PC.modal.exampleNote1}
                    </div>
                  )}
                  {PC.modal.exampleNote2 && (
                    <div
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: 11,
                        color: 'rgba(197,216,227,0.38)',
                        fontStyle: 'italic',
                        marginTop: 2,
                      }}
                    >
                      {PC.modal.exampleNote2}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    borderTop: '1px solid rgba(248,245,240,0.08)',
                  }}
                >
                  <button
                    onClick={() => setPriceOpen(!priceOpen)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '20px 28px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        color: 'rgba(197,216,227,0.85)',
                      }}
                    >
                      {PC.modal.pricingTitle}
                    </span>
                    <span
                      style={{
                        color: 'rgba(197,216,227,0.6)',
                        fontSize: 14,
                        transition: 'transform 200ms',
                        display: 'inline-block',
                        transform: priceOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▾
                    </span>
                  </button>
                  {priceOpen && (
                    <div style={{ padding: '0 28px 8px' }}>
                      {PC.modal.pricing?.map((row: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            padding: '9px 0',
                            borderBottom: '1px solid rgba(248,245,240,0.06)',
                            opacity: row.optional ? 0.65 : 1,
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontFamily: "'Lora',serif",
                                fontSize: 12,
                                color: 'rgba(248,245,240,0.85)',
                              }}
                            >
                              {row.label}
                            </span>
                            {row.note && (
                              <div
                                style={{
                                  fontFamily: "'Lora',serif",
                                  fontSize: 10,
                                  color: 'rgba(197,216,227,0.38)',
                                  marginTop: 2,
                                }}
                              >
                                {row.note}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              flexShrink: 0,
                              marginLeft: 20,
                              textAlign: 'right',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'Cormorant Garamond',Georgia,serif",
                                fontSize: 17,
                                fontWeight: 500,
                                color: '#f8f5f0',
                              }}
                            >
                              {row.price}
                            </span>
                            <span
                              style={{
                                fontFamily: "'Lora',serif",
                                fontSize: 10,
                                color: 'rgba(197,216,227,0.38)',
                                marginLeft: 4,
                              }}
                            >
                              {row.per}
                            </span>
                            {row.price2 && (
                              <>
                                <span
                                  style={{
                                    fontFamily: "'Cormorant Garamond',Georgia,serif",
                                    fontSize: 17,
                                    fontWeight: 500,
                                    color: '#f8f5f0',
                                    marginLeft: 10,
                                  }}
                                >
                                  {row.price2}
                                </span>
                                <span
                                  style={{
                                    fontFamily: "'Lora',serif",
                                    fontSize: 10,
                                    color: 'rgba(197,216,227,0.38)',
                                    marginLeft: 4,
                                  }}
                                >
                                  {row.per2}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      <div style={{ paddingBottom: 12 }} />
                    </div>
                  )}
                </div>
                <div style={{ padding: '0 28px 28px' }}>
                  <button
                    onClick={() => {
                      setPreCruiseModal(false);
                      handleNavigate('contact');
                    }}
                    style={{
                      width: '100%',
                      fontFamily: "'Lora',serif",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '14px',
                      borderRadius: 2,
                      border: 'none',
                      cursor: 'pointer',
                      background: '#c4703f',
                      color: '#f8f5f0',
                    }}
                  >
                    {PC.modal.ctaLabel}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={filtersStyle}>
            {filters.map(f => (
              <button
                key={f}
                style={filterStyle(f === activeFilter)}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={gridStyle}>
            {filtered.map(tour => (
              <TourCard
                key={tour.id}
                tour={tour}
                onSelect={setSelectedTour}
                onVariantPick={setVariantPickerTour}
              />
            ))}
          </div>

          {/* Special cards */}
          {SC && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 20,
                marginTop: 32,
              }}
            >
              {SC.patagonia && (
                <div
                  style={{
                    background: '#0d1f35',
                    borderRadius: 4,
                    padding: '28px 28px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(248,245,240,0.08)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#c4703f',
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    {SC.patagonia.eyebrow}
                  </span>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond',Georgia,serif",
                      fontSize: 22,
                      fontWeight: 300,
                      fontStyle: 'italic',
                      color: '#f8f5f0',
                      lineHeight: 1.15,
                      marginBottom: 10,
                    }}
                  >
                    {SC.patagonia.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 12,
                      lineHeight: 1.8,
                      color: 'rgba(197,216,227,0.8)',
                      flex: 1,
                      marginBottom: 20,
                    }}
                  >
                    {SC.patagonia.desc}
                  </p>
                  <button
                    onClick={() => handleNavigate('contact')}
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '10px 20px',
                      borderRadius: 2,
                      border: '1px solid rgba(248,245,240,0.3)',
                      cursor: 'pointer',
                      background: 'transparent',
                      color: '#f8f5f0',
                      alignSelf: 'flex-start',
                    }}
                  >
                    {SC.patagonia.cta}
                  </button>
                </div>
              )}
              {SC.gastrotour && (
                <div
                  style={{
                    background: '#f8f5f0',
                    borderRadius: 4,
                    padding: '28px 28px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(13,31,53,0.10)',
                    opacity: 0.8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#c4703f',
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    {SC.gastrotour.eyebrow}
                  </span>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond',Georgia,serif",
                      fontSize: 22,
                      fontWeight: 300,
                      fontStyle: 'italic',
                      color: '#0d1f35',
                      lineHeight: 1.15,
                      marginBottom: 10,
                    }}
                  >
                    {SC.gastrotour.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 12,
                      lineHeight: 1.8,
                      color: '#5c5040',
                      flex: 1,
                      marginBottom: 20,
                    }}
                  >
                    {SC.gastrotour.desc}
                  </p>
                  <span
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 11,
                      color: '#9e8e76',
                      fontStyle: 'italic',
                    }}
                  >
                    {SC.gastrotour.note}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeAudience === 'b2b' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {(content.b2bCards as any[])?.map((card: any, i: number) => (
            <div
              key={i}
              style={{
                background: '#f8f5f0',
                borderRadius: 4,
                border: '1px solid rgba(13,31,53,0.10)',
                boxShadow: '0 2px 16px rgba(13,31,53,0.07)',
                padding: '24px 24px 20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#c4703f',
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                {card.sub}
              </span>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond',Georgia,serif",
                  fontSize: 24,
                  fontWeight: 400,
                  color: '#0d1f35',
                  lineHeight: 1.15,
                  marginBottom: 12,
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 12,
                  lineHeight: 1.75,
                  color: '#5c5040',
                  flex: 1,
                  marginBottom: 16,
                }}
              >
                {card.desc}
              </p>
              <ul style={{ listStyle: 'none', marginBottom: 20 }}>
                {card.items?.map((item: string) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 11,
                      color: '#7d6e5a',
                      padding: '5px 0',
                      borderBottom: '1px solid rgba(13,31,53,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ color: '#c4703f' }}>–</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleNavigate('contact')}
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '11px 20px',
                  borderRadius: 2,
                  border: '1px solid #0d1f35',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#0d1f35',
                  transition: 'all 180ms',
                  alignSelf: 'flex-start',
                }}
              >
                {card.cta}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Variant picker */}
      {variantPickerTour && (
        <VariantPicker
          tour={variantPickerTour}
          cartKeys={cartKeysForTour(variantPickerTour.id)}
          onApply={selectedKeys =>
            applyVariantSelection(variantPickerTour, selectedKeys)
          }
          onClose={() => setVariantPickerTour(null)}
        />
      )}

      {/* Tour detail modal */}
      {selectedTour && (
        <TourModal
          tour={selectedTour}
          onClose={() => setSelectedTour(null)}
          onNavigate={handleNavigate}
        />
      )}
    </section>
  );
}
