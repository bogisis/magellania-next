'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart';
import {
  getTourVariants,
  getTourMinPrice,
  rowDisplayPrice,
  rowNote,
  isGuideRow,
  getCartItemPrice,
  suggestTierCount,
  maxForTierLabel,
} from '@/lib/pricing';
import type { Tour, GroupSize, PriceRow } from '@/types';

interface TourModalProps {
  tour: Tour;
  onClose: () => void;
  onNavigate?: (target: string) => void;
}

export default function TourModal({ tour, onClose, onNavigate }: TourModalProps) {
  const {
    priceMap,
    tours,
    groupSize,
    setGroupSize,
    cartKeysForTour,
    cartCountForTour,
    cartTicketCountsForTour,
    toggleSingleCart,
    applyVariantSelection,
    guidesInOtherTours,
  } = useCart();

  if (!tour) return null;

  const PRICE_MAP = priceMap;
  const variants = getTourVariants(tour);
  const isMulti = variants.length > 1;
  const cartKeys = cartKeysForTour(tour.id);
  const cartCount = cartCountForTour(tour.id);
  const cartTicketCounts = cartTicketCountsForTour(tour.id);
  const inCart = cartCount > 0;
  const hasTickets = variants.some(k => PRICE_MAP[k]?.pricingType === 'tickets');
  const totalPeople =
    ((groupSize && groupSize.adults) || 0) + ((groupSize && groupSize.children) || 0) || 1;
  const days = groupSize.days || 1;
  const guidesOther = guidesInOtherTours(tour.id);

  // ── Guide locking: slots taken by other tours ──
  const guideLockedMsg = (key: string): string | null => {
    if (!isGuideRow(PRICE_MAP[key])) return null;
    if (cartKeys.has(key)) return null;
    if (guidesOther < days) return null;
    return days === 1
      ? 'Гид уже выбран на этот день в другой экскурсии. Добавьте дни или снимите гида там.'
      : `Все ${days} дня с гидом уже распределены. Добавьте дни или снимите гида с другой экскурсии.`;
  };

  // ── Service rules ──
  const svcRules = tour.serviceRules || {};
  const reqKeys = variants.filter(k => svcRules[k]?.state === 'required');
  const optKeys = variants.filter(k => svcRules[k]?.state === 'optional');
  const condKeys = variants.filter(k => svcRules[k]?.state === 'conditional');
  const stdKeys = variants.filter(
    k => !svcRules[k]?.state || svcRules[k]?.state === 'default',
  );
  const hasRules = reqKeys.length > 0 || optKeys.length > 0 || condKeys.length > 0;

  const condTriggerNames = (requiredWhen: string[] | undefined) =>
    (requiredWhen || []).map(k => PRICE_MAP[k]?.name || k).join(', ');

  // Recalculate conditional dependencies
  const applyConditional = (s: Set<string>) => {
    const next = new Set(s);
    condKeys.forEach(condKey => {
      const rule = svcRules[condKey] || {};
      const triggers = rule.requiredWhen || [];
      const anyActive = triggers.some(t => next.has(t));
      if (anyActive && !guideLockedMsg(condKey)) next.add(condKey);
      else next.delete(condKey);
    });
    return next;
  };

  // Multi-select: checkboxes for variants, init from current cart
  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set(cartKeys || []);
    reqKeys.forEach(k => s.add(k));
    return applyConditional(s);
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ── Responsive ──
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // ── Ticket counts ──
  const [ticketCounts, setTicketCounts] = useState<Record<string, any>>(() => {
    if (cartTicketCounts && Object.keys(cartTicketCounts).length > 0) return cartTicketCounts;
    const ticketVariants = variants.filter(k => PRICE_MAP[k]?.pricingType === 'tickets');
    const tc: Record<string, any> = {};
    ticketVariants.forEach(key => {
      const row = PRICE_MAP[key];
      if (row?.classOptions?.length) {
        tc[key] = {};
        row.classOptions.forEach(cls => {
          tc[key][cls.label] = {};
          (cls.ticketTiers || []).forEach(tier => {
            tc[key][cls.label][tier.label] = 0;
          });
        });
      } else if (row?.ticketTiers?.length) {
        tc[key] = {};
        row.ticketTiers.forEach(tier => {
          tc[key][tier.label] =
            ticketVariants.length === 1 ? suggestTierCount(tier.label, groupSize) : 0;
        });
      }
    });
    return tc;
  });

  const isTicketKey = (key: string) => PRICE_MAP[key]?.pricingType === 'tickets';

  // Total tickets in a row (any format)
  const getTicketTotal = (key: string): number => {
    const row = PRICE_MAP[key];
    const tc = ticketCounts[key] || {};
    if (row?.classOptions?.length) {
      return row.classOptions.reduce(
        (sum: number, cls) =>
          sum +
          Object.values((tc[cls.label] || {}) as Record<string, number>).reduce(
            (a: number, b: number) => a + b,
            0,
          ),
        0,
      );
    }
    return Object.values(tc as Record<string, number>).reduce(
      (s: number, n: number) => s + n,
      0,
    );
  };

  // Total price for tickets in a row (any format)
  const getTicketPrice = (key: string): number => {
    const row = PRICE_MAP[key];
    const tc = ticketCounts[key] || {};
    if (row?.classOptions?.length) {
      return row.classOptions.reduce(
        (sum: number, cls) =>
          sum +
          (cls.ticketTiers || []).reduce(
            (s: number, tier) =>
              s + (tier.price || 0) * (((tc[cls.label] || {})[tier.label]) || 0),
            0,
          ),
        0,
      );
    }
    return (row?.ticketTiers || []).reduce(
      (s: number, tier) => s + (tier.price || 0) * (tc[tier.label] || 0),
      0,
    );
  };

  // Counter for flat format (no classOptions)
  const setTierCount = (key: string, tierLabel: string, delta: number) => {
    setTicketCounts(tc => {
      const prev = tc[key] || {};
      const maxVal = maxForTierLabel(tierLabel, groupSize);
      // Cross-variant protection
      const alreadyInOthers = variants
        .filter(
          k =>
            k !== key && PRICE_MAP[k]?.pricingType === 'tickets' && !PRICE_MAP[k]?.classOptions,
        )
        .reduce((sum, k) => sum + ((tc[k] || {})[tierLabel] || 0), 0);
      const maxForThis = Math.max(0, maxVal - alreadyInOthers);
      const newCount = Math.max(0, Math.min(maxForThis, (prev[tierLabel] || 0) + delta));
      const newForKey = { ...prev, [tierLabel]: newCount };
      const total = Object.values(newForKey as Record<string, number>).reduce(
        (s: number, n: number) => s + n,
        0,
      );
      setSelected(s => {
        const ns = new Set(s);
        total > 0 ? ns.add(key) : ns.delete(key);
        return ns;
      });
      return { ...tc, [key]: newForKey };
    });
  };

  // Counter for classOptions format
  const setClassTierCount = (
    key: string,
    classLabel: string,
    tierLabel: string,
    delta: number,
  ) => {
    setTicketCounts(tc => {
      const row = PRICE_MAP[key];
      const classCounts = (tc[key]?.[classLabel]) || {};
      const maxVal = maxForTierLabel(tierLabel, groupSize);
      // How many of this tier already taken in OTHER classes of this row
      const alreadyInOtherClasses = (row?.classOptions || [])
        .filter(c => c.label !== classLabel)
        .reduce((sum, c) => sum + ((tc[key]?.[c.label]?.[tierLabel]) || 0), 0);
      const maxForThis = Math.max(0, maxVal - alreadyInOtherClasses);
      const newCount = Math.max(
        0,
        Math.min(maxForThis, (classCounts[tierLabel] || 0) + delta),
      );
      const newClassCounts = { ...classCounts, [tierLabel]: newCount };
      // Update selected: if at least one ticket chosen — key is active
      const allTotal = (row?.classOptions || []).reduce((sum, c) => {
        const cc =
          c.label === classLabel ? newClassCounts : (tc[key]?.[c.label]) || {};
        return (
          sum +
          Object.values(cc as Record<string, number>).reduce(
            (a: number, b: number) => a + b,
            0,
          )
        );
      }, 0);
      setSelected(s => {
        const ns = new Set(s);
        allTotal > 0 ? ns.add(key) : ns.delete(key);
        return ns;
      });
      return { ...tc, [key]: { ...(tc[key] || {}), [classLabel]: newClassCounts } };
    });
  };

  const toggle = (key: string) => {
    if (reqKeys.includes(key)) return; // required — can't uncheck
    if (guideLockedMsg(key)) return; // guide locked — slots taken

    setSelected(s => {
      const next = new Set(s);
      next.has(key) ? next.delete(key) : next.add(key);

      if (!condKeys.includes(key)) {
        // Normal key — recalculate only those conditional keys for which key is a trigger
        condKeys.forEach(condKey => {
          const triggers = svcRules[condKey]?.requiredWhen || [];
          if (!triggers.includes(key)) return;
          const anyActive = triggers.some(t => next.has(t));
          if (anyActive) next.add(condKey);
          else next.delete(condKey);
        });
      }

      return next;
    });
  };

  const count = selected.size;

  // Price: sum of selected variants or min tour price
  let displayPrice: string;
  let displayNote: string;

  const getTourMinNote = (t: Tour): string => {
    if (variants.length > 1) return `${variants.length} вар.`;
    if (variants.length === 1) {
      const row = PRICE_MAP[variants[0]];
      return row ? rowNote(row) : t.priceNote || '';
    }
    return t.priceNote || '';
  };

  if (isMulti || hasTickets) {
    if (count > 0 || (hasTickets && variants.some(k => getTicketTotal(k) > 0))) {
      const sum = Array.from(selected).reduce((s, key) => {
        if (isTicketKey(key)) return s + getTicketPrice(key);
        return (
          s +
          getCartItemPrice(
            { id: '', tourId: tour.id, variantKey: key },
            groupSize,
            PRICE_MAP,
            tours,
          )
        );
      }, 0);
      displayPrice = sum > 0 ? `$${sum.toLocaleString()}` : getTourMinPrice(tour, PRICE_MAP);
      displayNote = isMulti
        ? `${count} ${count === 1 ? 'позиция' : count < 5 ? 'позиции' : 'позиций'} · ${totalPeople} чел.`
        : 'итого за билеты';
    } else {
      displayPrice = getTourMinPrice(tour, PRICE_MAP);
      displayNote = getTourMinNote(tour);
    }
  } else {
    const onlyKey = variants[0] || null;
    const onlyPd = onlyKey ? PRICE_MAP[onlyKey] : null;
    displayPrice = onlyPd ? rowDisplayPrice(onlyPd) : getTourMinPrice(tour, PRICE_MAP);
    displayNote = onlyPd ? rowNote(onlyPd) : getTourMinNote(tour);
  }

  // Gallery state
  const [galleryIdx, setGalleryIdx] = useState(0);

  const hasGalleryPhoto = tour.gallery && tour.gallery.length > 0;
  const currentGalleryItem = hasGalleryPhoto ? tour.gallery[galleryIdx] : null;
  const currentGalleryImg = currentGalleryItem
    ? typeof currentGalleryItem === 'string'
      ? currentGalleryItem
      : currentGalleryItem.file
    : null;
  const headerBg = currentGalleryImg
    ? `url('/img/tours/${currentGalleryImg}') center/cover no-repeat`
    : tour.bg || '#1a2e4a';

  const metaItems = [
    tour.duration && { icon: '⏱', label: tour.duration },
    tour.transport && { icon: '🚗', label: tour.transport },
    tour.maxGroup && { icon: '👥', label: tour.maxGroup },
    tour.language && { icon: '🌍', label: tour.language },
    tour.season && { icon: '📅', label: tour.season },
    tour.meetingPoint && { icon: '📍', label: tour.meetingPoint },
    tour.childrenOk && { icon: '👶', label: 'Можно с детьми' },
  ].filter(Boolean) as Array<{ icon: string; label: string }>;

  const handleCart = () => {
    if (isMulti || hasTickets) {
      applyVariantSelection(tour, selected, ticketCounts);
    } else {
      toggleSingleCart(tour, variants[0] || null);
    }
    onClose();
  };

  const cartBtnLabel = isMulti
    ? count > 0
      ? `+ Заказать ${count} ${count === 1 ? 'позицию' : count < 5 ? 'позиции' : 'позиций'} →`
      : inCart
        ? 'Убрать из тура'
        : '+ Заказать'
    : inCart
      ? '✓ В туре — убрать'
      : '+ Заказать';

  const cartBtnFilled = isMulti ? count > 0 || inCart : inCart;

  // ── Helper: render a variant checkbox row (standard or optional) ──
  const renderCheckboxRow = (
    key: string,
    pd: PriceRow,
    colorScheme: 'standard' | 'optional' | 'conditional',
  ) => {
    const isSel = selected.has(key);
    const lockMsg = guideLockedMsg(key);

    // Color scheme
    const cs = {
      standard: {
        border: isSel ? '2px solid #c4703f' : '1px solid rgba(13,31,53,0.09)',
        bg: isSel ? '#fff7ed' : '#fff',
        cbBorder: isSel ? 'none' : '2px solid rgba(13,31,53,0.2)',
        cbBg: isSel ? '#c4703f' : 'transparent',
        nameColor: '#0d1f35',
        priceColor: '#0d1f35',
        noteColor: pd.pricingType === 'person' ? '#c4703f' : '#9e8e76',
      },
      optional: {
        border: isSel
          ? '2px solid #3b82f6'
          : '1.5px dashed rgba(59,130,246,0.4)',
        bg: isSel ? '#eff6ff' : 'rgba(239,246,255,0.4)',
        cbBorder: isSel ? 'none' : '2px solid rgba(59,130,246,0.4)',
        cbBg: isSel ? '#3b82f6' : 'transparent',
        nameColor: '#1e40af',
        priceColor: '#1e40af',
        noteColor: '#3b82f6',
      },
      conditional: {
        border: isSel ? '2px solid #8b5cf6' : '1.5px solid #c4b5fd',
        bg: isSel ? '#f5f3ff' : 'rgba(245,243,255,0.5)',
        cbBorder: isSel ? 'none' : '2px solid #c4b5fd',
        cbBg: isSel ? '#8b5cf6' : 'transparent',
        nameColor: '#4c1d95',
        priceColor: '#4c1d95',
        noteColor: '#7c3aed',
      },
    }[colorScheme];

    return (
      <div
        key={key}
        onClick={() => toggle(key)}
        style={{
          padding: colorScheme === 'standard' ? '11px 14px' : '10px 14px',
          marginBottom: 6,
          borderRadius: 4,
          cursor: lockMsg ? 'not-allowed' : 'pointer',
          border: lockMsg ? '1px solid rgba(13,31,53,0.07)' : cs.border,
          background: lockMsg ? 'rgba(13,31,53,0.03)' : cs.bg,
          opacity: lockMsg ? 0.7 : 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          transition: 'all 140ms',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: colorScheme === 'conditional' ? 'flex-start' : 'center' }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 2,
              flexShrink: 0,
              marginTop: colorScheme === 'conditional' ? 2 : 0,
              border: lockMsg ? '2px solid rgba(13,31,53,0.12)' : cs.cbBorder,
              background: lockMsg ? 'rgba(13,31,53,0.07)' : cs.cbBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 120ms',
            }}
          >
            {lockMsg ? (
              <span style={{ fontSize: 10, lineHeight: 1 }}>🔒</span>
            ) : isSel ? (
              <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>
            ) : null}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 13,
                fontWeight: isSel ? 600 : 500,
                color: lockMsg ? '#9e8e76' : cs.nameColor,
                lineHeight: 1.4,
              }}
            >
              {pd.name}
            </div>
            {colorScheme === 'conditional' && !lockMsg && svcRules[key]?.requiredWhen?.length! > 0 && (
              <div
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 10,
                  color: '#7c3aed',
                  marginTop: 3,
                  lineHeight: 1.45,
                }}
              >
                обязательна при выборе: {condTriggerNames(svcRules[key]?.requiredWhen)}
              </div>
            )}
            {!lockMsg && pd.desc && (
              <div
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 10,
                  color: '#9e8e76',
                  marginTop: 2,
                  lineHeight: 1.5,
                }}
              >
                {pd.desc}
              </div>
            )}
            {!lockMsg && !pd.desc && pd.duration && (
              <div
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 10,
                  color: colorScheme === 'optional' ? '#6b7280' : '#9e8e76',
                  marginTop: 2,
                }}
              >
                {pd.duration}
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: 20,
                fontWeight: 500,
                color: lockMsg ? '#9e8e76' : cs.priceColor,
                lineHeight: 1,
              }}
            >
              {rowDisplayPrice(pd)}
            </div>
            <div
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 9,
                color: lockMsg ? '#9e8e76' : cs.noteColor,
                marginTop: 2,
              }}
            >
              {rowNote(pd)}
            </div>
          </div>
        </div>
        {lockMsg && (
          <div
            style={{
              marginTop: 7,
              marginLeft: 30,
              fontFamily: "'Lora',serif",
              fontSize: 10,
              color: '#b45309',
              lineHeight: 1.55,
              background: 'rgba(251,191,36,0.12)',
              borderRadius: 3,
              padding: '5px 8px',
              border: '1px solid rgba(251,191,36,0.3)',
            }}
          >
            {lockMsg}
          </div>
        )}
        {!lockMsg && pd.disclaimer && (
          <div
            style={{
              fontFamily: "'Lora',serif",
              fontSize: 9.5,
              color: 'rgba(13,31,53,0.38)',
              fontStyle: 'italic',
              lineHeight: 1.45,
              marginTop: 3,
              marginLeft: 30,
            }}
          >
            {pd.disclaimer}
          </div>
        )}
      </div>
    );
  };

  // ── Helper: render a ticket row ──
  const renderTicketRow = (
    key: string,
    pd: PriceRow,
    colorScheme: 'standard' | 'optional',
  ) => {
    const total = getTicketTotal(key);
    const tprice = getTicketPrice(key);
    const isOpt = colorScheme === 'optional';
    const accentColor = isOpt ? '#1d4ed8' : '#0d1f35';
    const accentLight = isOpt ? 'rgba(29,78,216,0.1)' : 'rgba(13,31,53,0.08)';
    const borderActive = isOpt ? '2px solid #3b82f6' : '2px solid #c4703f';
    const borderInactive = isOpt
      ? '1.5px dashed rgba(59,130,246,0.4)'
      : '1px solid rgba(13,31,53,0.09)';
    const bgActive = isOpt ? '#eff6ff' : '#fff7ed';
    const bgInactive = isOpt ? 'rgba(239,246,255,0.4)' : '#fff';
    const nameColor = isOpt ? '#1e40af' : '#0d1f35';
    const descColor = isOpt ? '#6b7280' : '#9e8e76';
    const cntColor = isOpt ? '#1e40af' : '#0d1f35';
    const borderLeftActive = isOpt ? '2px solid #3b82f6' : '2px solid #c4703f';
    const borderLeftInactive = isOpt
      ? '2px solid rgba(59,130,246,0.2)'
      : '2px solid rgba(13,31,53,0.1)';
    const classLabelColor = isOpt ? '#1d4ed8' : '#c4703f';
    const classLabelInactive = isOpt ? '#6b7280' : '#9e8e76';
    const tierLabelColor = isOpt ? '#374151' : '#5c5040';
    const tierPriceColor = isOpt ? '#6b7280' : '#9e8e76';

    // classOptions format
    if (pd.classOptions?.length) {
      const minP = Math.min(
        ...pd.classOptions
          .flatMap(c => (c.ticketTiers || []).map(t => t.price || 0))
          .filter(p => p > 0),
        0,
      );
      return (
        <div
          key={key}
          style={{
            padding: '11px 14px',
            marginBottom: 6,
            borderRadius: 4,
            border: total > 0 ? borderActive : borderInactive,
            background: total > 0 ? bgActive : bgInactive,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            transition: 'all 140ms',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🎫</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 13,
                  fontWeight: total > 0 ? 600 : 500,
                  color: nameColor,
                  lineHeight: 1.4,
                }}
              >
                {pd.name}
              </div>
              {pd.desc && (
                <div
                  style={{
                    fontFamily: "'Lora',serif",
                    fontSize: 10,
                    color: descColor,
                    marginTop: 2,
                  }}
                >
                  {pd.desc}
                </div>
              )}
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',Georgia,serif",
                  fontSize: 18,
                  fontWeight: 500,
                  color: nameColor,
                  lineHeight: 1,
                }}
              >
                {total > 0 ? `$${tprice}` : minP > 0 ? `от $${minP}` : '—'}
              </div>
              <div
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 9,
                  color: descColor,
                  marginTop: 2,
                }}
              >
                за билеты
              </div>
            </div>
          </div>
          {pd.classOptions.map(cls => {
            const classTotal = Object.values(
              ((ticketCounts[key]?.[cls.label]) || {}) as Record<string, number>,
            ).reduce((a: number, b: number) => a + b, 0);
            return (
              <div
                key={cls.label}
                style={{
                  marginLeft: 28,
                  paddingLeft: 12,
                  borderLeft: classTotal > 0 ? borderLeftActive : borderLeftInactive,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Lora',serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: classTotal > 0 ? classLabelColor : classLabelInactive,
                    marginBottom: 6,
                  }}
                >
                  {cls.label}
                  {classTotal > 0 && (
                    <span
                      style={{
                        fontWeight: 400,
                        textTransform: 'none',
                        letterSpacing: 0,
                        marginLeft: 6,
                        color: classLabelColor,
                      }}
                    >
                      (выбрано {classTotal})
                    </span>
                  )}
                </div>
                {(cls.ticketTiers || []).map(tier => {
                  const cnt = (ticketCounts[key]?.[cls.label]?.[tier.label]) || 0;
                  return (
                    <div
                      key={tier.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: 11,
                          color: tierLabelColor,
                          flex: 1,
                        }}
                      >
                        {tier.label}
                        {tier.ageFrom !== undefined && tier.ageTo !== undefined
                          ? ` (${tier.ageFrom}–${tier.ageTo} л.)`
                          : ''}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setClassTierCount(key, cls.label, tier.label, -1);
                          }}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: cnt > 0 ? accentColor : accentLight,
                            border: 'none',
                            cursor: cnt > 0 ? 'pointer' : 'default',
                            color: cnt > 0 ? '#f8f5f0' : '#9e8e76',
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 120ms',
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond',Georgia,serif",
                            fontSize: 16,
                            fontWeight: 500,
                            color: cntColor,
                            minWidth: 22,
                            textAlign: 'center',
                          }}
                        >
                          {cnt}
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setClassTierCount(key, cls.label, tier.label, +1);
                          }}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: accentColor,
                            border: 'none',
                            cursor: 'pointer',
                            color: isOpt ? '#fff' : '#f8f5f0',
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          +
                        </button>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: 11,
                          color: tierPriceColor,
                          minWidth: 64,
                          textAlign: 'right',
                        }}
                      >
                        ${tier.price || 0}/чел.
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {pd.disclaimer && (
            <div
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 9.5,
                color: 'rgba(13,31,53,0.38)',
                fontStyle: 'italic',
                lineHeight: 1.45,
                paddingTop: 3,
              }}
            >
              {pd.disclaimer}
            </div>
          )}
        </div>
      );
    }

    // Flat format (ticketTiers)
    const minP = Math.min(
      ...(pd.ticketTiers || []).map(t => t.price || 0).filter(p => p > 0),
      0,
    );
    return (
      <div
        key={key}
        style={{
          padding: '11px 14px',
          marginBottom: 6,
          borderRadius: 4,
          border: total > 0 ? borderActive : borderInactive,
          background: total > 0 ? bgActive : bgInactive,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          transition: 'all 140ms',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🎫</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 13,
                fontWeight: total > 0 ? 600 : 500,
                color: nameColor,
                lineHeight: 1.4,
              }}
            >
              {pd.name}
            </div>
            {pd.desc && (
              <div
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 10,
                  color: descColor,
                  marginTop: 2,
                }}
              >
                {pd.desc}
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: 18,
                fontWeight: 500,
                color: nameColor,
                lineHeight: 1,
              }}
            >
              {total > 0 ? `$${tprice}` : minP > 0 ? `от $${minP}` : '—'}
            </div>
            <div
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 9,
                color: descColor,
                marginTop: 2,
              }}
            >
              за билеты
            </div>
          </div>
        </div>
        {(pd.ticketTiers || []).map(tier => {
          const cnt = (ticketCounts[key] || {})[tier.label] || 0;
          return (
            <div
              key={tier.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingLeft: 28,
              }}
            >
              <span
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 11,
                  color: tierLabelColor,
                  flex: 1,
                }}
              >
                {tier.label}
                {tier.ageFrom !== undefined && tier.ageTo !== undefined
                  ? ` (${tier.ageFrom}–${tier.ageTo} лет)`
                  : ''}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setTierCount(key, tier.label, -1);
                  }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: cnt > 0 ? accentColor : accentLight,
                    border: 'none',
                    cursor: cnt > 0 ? 'pointer' : 'default',
                    color: cnt > 0 ? '#f8f5f0' : '#9e8e76',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 120ms',
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond',Georgia,serif",
                    fontSize: 16,
                    fontWeight: 500,
                    color: cntColor,
                    minWidth: 22,
                    textAlign: 'center',
                  }}
                >
                  {cnt}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setTierCount(key, tier.label, +1);
                  }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: accentColor,
                    border: 'none',
                    cursor: 'pointer',
                    color: isOpt ? '#fff' : '#f8f5f0',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +
                </button>
              </div>
              <span
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 11,
                  color: tierPriceColor,
                  minWidth: 64,
                  textAlign: 'right',
                }}
              >
                ${tier.price || 0}/чел.
              </span>
            </div>
          );
        })}
        {pd.disclaimer && (
          <div
            style={{
              fontFamily: "'Lora',serif",
              fontSize: 9.5,
              color: 'rgba(13,31,53,0.38)',
              fontStyle: 'italic',
              lineHeight: 1.45,
              paddingTop: 3,
            }}
          >
            {pd.disclaimer}
          </div>
        )}
      </div>
    );
  };

  // ── Helper: render a variant section (standard or optional keys) ──
  const renderVariantKeys = (
    keys: string[],
    colorScheme: 'standard' | 'optional',
  ) =>
    keys.map(key => {
      const pd = PRICE_MAP[key];
      if (!pd) return null;
      if (pd.pricingType === 'tickets') return renderTicketRow(key, pd, colorScheme);
      return renderCheckboxRow(key, pd, colorScheme);
    });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(6,14,24,0.78)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 'clamp(16px,4vw,24px)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#f8f5f0',
          borderRadius: isMobile ? '12px 12px 0 0' : 4,
          maxWidth: isMobile ? '100%' : 720,
          width: '100%',
          boxShadow: '0 16px 64px rgba(13,31,53,0.3)',
          overflow: 'hidden',
          maxHeight: isMobile ? '90vh' : '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Photo header */}
        <div
          style={{
            height: isMobile ? 160 : 240,
            background: headerBg,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(6,14,24,0.82) 0%, rgba(6,14,24,0.18) 60%, transparent 100%)',
            }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(6,14,24,0.55)',
              border: 'none',
              cursor: 'pointer',
              color: '#f8f5f0',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            ✕
          </button>
          {/* Bottom panel: category + title left, thumbnails right */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: isMobile ? '12px 16px' : '14px 24px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <span
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(248,245,240,0.65)',
                  display: 'block',
                  marginBottom: 5,
                }}
              >
                {tour.category}
              </span>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',Georgia,serif",
                  fontSize: isMobile ? '1.45rem' : 'clamp(1.6rem,3vw,2.1rem)',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: '#f8f5f0',
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                {tour.title}
              </h2>
            </div>
            {/* Gallery thumbnails */}
            {hasGalleryPhoto && tour.gallery.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  flexShrink: 0,
                  alignSelf: 'flex-end',
                }}
              >
                {tour.gallery.slice(0, 4).map((item, gi) => {
                  const filename =
                    typeof item === 'string' ? item : item.file;
                  return (
                    <div
                      key={gi}
                      onClick={() => setGalleryIdx(gi)}
                      style={{
                        width: isMobile ? 32 : 38,
                        height: isMobile ? 24 : 30,
                        borderRadius: 2,
                        backgroundImage: `url('/img/tours/${filename}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border:
                          galleryIdx === gi
                            ? '2px solid #f8f5f0'
                            : '1px solid rgba(248,245,240,0.35)',
                        opacity: galleryIdx === gi ? 1 : 0.8,
                        cursor: 'pointer',
                        transition: 'all 120ms',
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Body — scrollable */}
        <div
          style={{
            padding: isMobile ? '14px 16px' : '18px 24px',
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          {/* Pickers + Info chips */}
          <div
            style={{
              display: 'flex',
              gap: isMobile ? 12 : 20,
              marginBottom: isMobile ? 14 : 20,
              paddingBottom: isMobile ? 12 : 16,
              borderBottom: '1px solid rgba(13,31,53,0.09)',
              alignItems: 'flex-start',
            }}
          >
            {/* LEFT: 3 pickers in column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? 7 : 9,
                flexShrink: 0,
                width: isMobile ? 'auto' : 164,
              }}
            >
              {/* Adults */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Lora',serif",
                    fontSize: 10,
                    color: '#7d6e5a',
                  }}
                >
                  Взрослых
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <button
                    onClick={() => {
                      const a = groupSize.adults || 0;
                      const c = groupSize.children || 0;
                      if (a > 0 && !(a === 1 && c > 0))
                        setGroupSize({ ...groupSize, adults: a - 1 });
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      background:
                        (groupSize.adults || 0) > 0 &&
                        !((groupSize.adults || 0) === 1 && (groupSize.children || 0) > 0)
                          ? '#0d1f35'
                          : 'rgba(13,31,53,0.1)',
                      color:
                        (groupSize.adults || 0) > 0 &&
                        !((groupSize.adults || 0) === 1 && (groupSize.children || 0) > 0)
                          ? '#f8f5f0'
                          : '#9e8e76',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 120ms',
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond',Georgia,serif",
                      fontSize: 18,
                      fontWeight: 500,
                      color: '#0d1f35',
                      minWidth: 18,
                      textAlign: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {groupSize.adults || 0}
                  </span>
                  <button
                    onClick={() =>
                      setGroupSize({
                        ...groupSize,
                        adults: (groupSize.adults || 0) + 1,
                      })
                    }
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      background: '#0d1f35',
                      color: '#f8f5f0',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Lora',serif",
                    fontSize: 10,
                    color: '#7d6e5a',
                  }}
                >
                  Детей
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <button
                    onClick={() =>
                      (groupSize.children || 0) > 0 &&
                      setGroupSize({
                        ...groupSize,
                        children: (groupSize.children || 0) - 1,
                      })
                    }
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: 'none',
                      cursor: (groupSize.children || 0) > 0 ? 'pointer' : 'default',
                      background:
                        (groupSize.children || 0) > 0
                          ? '#0d1f35'
                          : 'rgba(13,31,53,0.1)',
                      color:
                        (groupSize.children || 0) > 0 ? '#f8f5f0' : '#9e8e76',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 120ms',
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond',Georgia,serif",
                      fontSize: 18,
                      fontWeight: 500,
                      color: '#0d1f35',
                      minWidth: 18,
                      textAlign: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {groupSize.children || 0}
                  </span>
                  <button
                    onClick={() =>
                      (groupSize.adults || 0) > 0 &&
                      setGroupSize({
                        ...groupSize,
                        children: (groupSize.children || 0) + 1,
                      })
                    }
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border:
                        (groupSize.adults || 0) > 0
                          ? 'none'
                          : '1.5px dashed rgba(13,31,53,0.3)',
                      cursor:
                        (groupSize.adults || 0) > 0 ? 'pointer' : 'not-allowed',
                      background:
                        (groupSize.adults || 0) > 0
                          ? '#0d1f35'
                          : 'rgba(13,31,53,0.15)',
                      color:
                        (groupSize.adults || 0) > 0 ? '#f8f5f0' : '#9e8e76',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 120ms',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Days */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Lora',serif",
                    fontSize: 10,
                    color: '#7d6e5a',
                  }}
                >
                  Дней
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <button
                    onClick={() =>
                      setGroupSize({
                        ...groupSize,
                        days: Math.max(1, (groupSize.days || 1) - 1),
                      })
                    }
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: 'none',
                      cursor:
                        (groupSize.days || 1) > 1 ? 'pointer' : 'default',
                      background:
                        (groupSize.days || 1) > 1
                          ? '#0d1f35'
                          : 'rgba(13,31,53,0.1)',
                      color:
                        (groupSize.days || 1) > 1 ? '#f8f5f0' : '#9e8e76',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 120ms',
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond',Georgia,serif",
                      fontSize: 18,
                      fontWeight: 500,
                      color: '#0d1f35',
                      minWidth: 18,
                      textAlign: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {groupSize.days || 1}
                  </span>
                  <button
                    onClick={() =>
                      setGroupSize({
                        ...groupSize,
                        days: (groupSize.days || 1) + 1,
                      })
                    }
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      background: '#0d1f35',
                      color: '#f8f5f0',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Warning if no adults */}
              {(groupSize.adults || 0) === 0 && (
                <div
                  style={{
                    fontFamily: "'Lora',serif",
                    fontSize: 9,
                    color: '#b45309',
                    background: 'rgba(251,191,36,0.12)',
                    border: '1px solid rgba(251,191,36,0.3)',
                    borderRadius: 3,
                    padding: '3px 7px',
                    lineHeight: 1.4,
                  }}
                >
                  добавьте взрослого
                </div>
              )}
            </div>

            {/* RIGHT: info chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: isMobile ? 4 : 5,
                flex: 1,
                alignContent: 'flex-start',
              }}
            >
              {metaItems
                .filter(i => i.icon !== '📍')
                .map(item => (
                  <span
                    key={item.label}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontFamily: "'Lora',serif",
                      fontSize: isMobile ? 9.5 : 10,
                      color: '#5c5040',
                      background: 'rgba(13,31,53,0.05)',
                      padding: '3px 8px',
                      borderRadius: 2,
                      border: '1px solid rgba(13,31,53,0.08)',
                      lineHeight: 1.35,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ fontSize: 10 }}>{item.icon}</span>
                    {item.label}
                  </span>
                ))}
              {tour.meetingPoint && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: "'Lora',serif",
                    fontSize: isMobile ? 9.5 : 10,
                    color: '#9e8e76',
                    fontStyle: 'italic',
                    lineHeight: 1.35,
                    width: '100%',
                    marginTop: 2,
                  }}
                >
                  📍 {tour.meetingPoint}
                </span>
              )}
            </div>
          </div>

          {/* Lead / Description */}
          {tour.lead ? (
            <p
              style={{
                fontFamily: "'Lora',serif",
                fontSize: isMobile ? 12.5 : 13.5,
                lineHeight: isMobile ? 1.65 : 1.75,
                color: '#3a3228',
                marginBottom: tour.desc ? 10 : 0,
              }}
            >
              {tour.lead}
            </p>
          ) : (
            <p
              style={{
                fontFamily: "'Lora',serif",
                fontSize: isMobile ? 12.5 : 13.5,
                lineHeight: isMobile ? 1.65 : 1.75,
                color: '#3a3228',
                marginBottom: 0,
              }}
            >
              {tour.desc}
            </p>
          )}

          {/* Program */}
          {tour.program && tour.program.length > 0 && (
            <div
              style={{
                marginTop: isMobile ? 12 : 16,
                paddingTop: isMobile ? 12 : 14,
                borderTop: '1px solid rgba(13,31,53,0.09)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#9e8e76',
                  marginBottom: 10,
                }}
              >
                Программа
              </div>
              {tour.program.map((step, si) => (
                <div
                  key={si}
                  style={{
                    display: 'flex',
                    gap: isMobile ? 8 : 10,
                    marginBottom:
                      si < tour.program.length - 1 ? (isMobile ? 7 : 7) : 0,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      minWidth: isMobile ? 34 : 38,
                      fontFamily: "'Lora',serif",
                      fontSize: isMobile ? 10 : 10.5,
                      fontWeight: 700,
                      color: '#c4703f',
                      letterSpacing: '0.02em',
                      paddingTop: 2,
                    }}
                  >
                    {step.time}
                  </div>
                  <div
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      paddingTop: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#c4703f',
                        flexShrink: 0,
                      }}
                    />
                    {si < tour.program.length - 1 && (
                      <div
                        style={{
                          width: 1,
                          flex: 1,
                          background: 'rgba(196,112,63,0.2)',
                          marginTop: 3,
                          minHeight: isMobile ? 10 : 10,
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: isMobile ? 11.5 : 12,
                      lineHeight: isMobile ? 1.5 : 1.55,
                      color: '#4a3f33',
                      paddingBottom:
                        si < tour.program.length - 1 ? 4 : 0,
                    }}
                  >
                    {step.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Variants / Tour composition — checkboxes with service rules */}
          {(isMulti || hasTickets) && (
            <div
              style={{
                marginTop: isMobile ? 12 : 16,
                paddingTop: isMobile ? 12 : 14,
                borderTop: '1px solid rgba(13,31,53,0.09)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#9e8e76',
                  marginBottom: 6,
                }}
              >
                {hasRules ? 'Состав тура' : 'Выберите варианты'}
              </div>
              {!hasRules && (
                <div
                  style={{
                    fontFamily: "'Lora',serif",
                    fontSize: 10,
                    color: '#9e8e76',
                    marginBottom: 12,
                  }}
                >
                  Можно отметить несколько — например, трансфер и сопровождение русским гидом
                </div>
              )}

              {/* Required */}
              {reqKeys.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  {hasRules && (
                    <div
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: '#b45309',
                        marginBottom: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      🔒 Обязательно включено
                    </div>
                  )}
                  {reqKeys.map(key => {
                    const pd = PRICE_MAP[key];
                    if (!pd) return null;
                    return (
                      <div
                        key={key}
                        style={{
                          padding: '10px 14px',
                          marginBottom: 6,
                          borderRadius: 4,
                          border: '1.5px solid #fbbf24',
                          background: '#fefce8',
                          display: 'flex',
                          gap: 12,
                          alignItems: 'center',
                          cursor: 'default',
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 2,
                            background: '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>
                            🔒
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: "'Lora',serif",
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#92400e',
                              lineHeight: 1.4,
                            }}
                          >
                            {pd.name}
                          </div>
                          {pd.desc && (
                            <div
                              style={{
                                fontFamily: "'Lora',serif",
                                fontSize: 10,
                                color: '#b45309',
                                marginTop: 2,
                                lineHeight: 1.5,
                              }}
                            >
                              {pd.desc}
                            </div>
                          )}
                          {!pd.desc && pd.duration && (
                            <div
                              style={{
                                fontFamily: "'Lora',serif",
                                fontSize: 10,
                                color: '#b45309',
                                marginTop: 2,
                              }}
                            >
                              {pd.duration}
                            </div>
                          )}
                        </div>
                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                          <div
                            style={{
                              fontFamily: "'Cormorant Garamond',Georgia,serif",
                              fontSize: 20,
                              fontWeight: 500,
                              color: '#92400e',
                              lineHeight: 1,
                            }}
                          >
                            {rowDisplayPrice(pd)}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Lora',serif",
                              fontSize: 9,
                              color: '#b45309',
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
              )}

              {/* Standard */}
              {stdKeys.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  {hasRules && stdKeys.length > 0 && (
                    <div
                      style={{
                        fontFamily: "'Lora',serif",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: '#9e8e76',
                        marginBottom: 6,
                        marginTop: reqKeys.length ? 10 : 0,
                      }}
                    >
                      В составе тура
                    </div>
                  )}
                  {renderVariantKeys(stdKeys, 'standard')}
                </div>
              )}

              {/* Conditional */}
              {condKeys.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#7c3aed',
                      marginBottom: 6,
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>⟶ Зависит от выбора</span>
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: 9,
                        color: '#a78bfa',
                        letterSpacing: 0,
                        textTransform: 'none',
                        fontStyle: 'italic',
                      }}
                    >
                      — добавляется автоматически, можно снять
                    </span>
                  </div>
                  {condKeys.map(key => {
                    const pd = PRICE_MAP[key];
                    if (!pd) return null;
                    return renderCheckboxRow(key, pd, 'conditional');
                  })}
                </div>
              )}

              {/* Optional */}
              {optKeys.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px dashed rgba(13,31,53,0.12)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#1d4ed8',
                      marginBottom: 6,
                    }}
                  >
                    + Можно добавить
                  </div>
                  {renderVariantKeys(optKeys, 'optional')}
                </div>
              )}
            </div>
          )}

          {/* Includes / Excludes */}
          {((tour.includes && tour.includes.length > 0) ||
            (tour.excludes && tour.excludes.length > 0)) && (
            <div
              style={{
                marginTop: isMobile ? 12 : 16,
                paddingTop: isMobile ? 12 : 14,
                borderTop: '1px solid rgba(13,31,53,0.09)',
                display: 'grid',
                gridTemplateColumns:
                  tour.includes?.length && tour.excludes?.length ? '1fr 1fr' : '1fr',
                gap: isMobile ? 12 : 16,
              }}
            >
              {tour.includes && tour.includes.length > 0 && (
                <div>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#9e8e76',
                      marginBottom: 8,
                    }}
                  >
                    Включено
                  </div>
                  {tour.includes.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 7,
                        alignItems: 'baseline',
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          color: '#4a9e6a',
                          fontSize: 10,
                          flexShrink: 0,
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                      <span
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: isMobile ? 11 : 11.5,
                          lineHeight: 1.5,
                          color: '#4a3f33',
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {tour.excludes && tour.excludes.length > 0 && (
                <div>
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#9e8e76',
                      marginBottom: 8,
                    }}
                  >
                    Доп. оплата
                  </div>
                  {tour.excludes.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 7,
                        alignItems: 'baseline',
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          color: '#c4703f',
                          fontSize: 12,
                          flexShrink: 0,
                          lineHeight: 1,
                        }}
                      >
                        +
                      </span>
                      <span
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: isMobile ? 11 : 11.5,
                          lineHeight: 1.5,
                          color: '#5c5040',
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FAQ accordion */}
          {tour.faq && tour.faq.length > 0 && (
            <div
              style={{
                marginTop: isMobile ? 12 : 16,
                paddingTop: isMobile ? 12 : 14,
                borderTop: '1px solid rgba(13,31,53,0.09)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#9e8e76',
                  marginBottom: 8,
                }}
              >
                Частые вопросы
              </div>
              {tour.faq.map((item, fi) => {
                const isOpen = openFaq === fi;
                return (
                  <div
                    key={fi}
                    style={{
                      borderBottom: '1px solid rgba(13,31,53,0.07)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : fi)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        padding: '9px 0',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: isMobile ? 12 : 12.5,
                          fontWeight: isOpen ? 600 : 500,
                          color: isOpen ? '#c4703f' : '#0d1f35',
                          lineHeight: 1.4,
                          flex: 1,
                        }}
                      >
                        {item.q}
                      </span>
                      <span
                        style={{
                          color: '#9e8e76',
                          fontSize: 14,
                          flexShrink: 0,
                          transition: 'transform 200ms',
                          display: 'inline-block',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                        }}
                      >
                        ▾
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          fontFamily: "'Lora',serif",
                          fontSize: isMobile ? 11.5 : 12,
                          lineHeight: 1.7,
                          color: '#5c5040',
                          paddingBottom: 10,
                        }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky footer — Price + CTA */}
        <div
          style={{
            flexShrink: 0,
            padding: isMobile ? '10px 16px' : '12px 24px',
            borderTop: '1px solid rgba(13,31,53,0.09)',
            background: '#f8f5f0',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? 8 : 14,
            boxShadow: '0 -4px 16px rgba(13,31,53,0.06)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: isMobile ? 26 : 30,
                fontWeight: 500,
                color: '#0d1f35',
                lineHeight: 1,
              }}
            >
              {displayPrice}
            </div>
            {displayNote && (
              <div
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 11,
                  color: '#9e8e76',
                  marginTop: 3,
                }}
              >
                {displayNote}
              </div>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 8,
              alignItems: 'stretch',
            }}
          >
            <button
              onClick={handleCart}
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '10px 20px',
                borderRadius: 2,
                border: cartBtnFilled
                  ? 'none'
                  : '1px solid rgba(196,112,63,0.5)',
                cursor: 'pointer',
                background: cartBtnFilled ? '#c4703f' : 'transparent',
                color: cartBtnFilled ? '#f8f5f0' : '#c4703f',
                transition: 'all 180ms',
                textAlign: 'center',
              }}
            >
              {cartBtnLabel}
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate && onNavigate('contact');
              }}
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '10px 24px',
                borderRadius: 2,
                border: 'none',
                cursor: 'pointer',
                background: '#0d1f35',
                color: '#f8f5f0',
                textAlign: 'center',
              }}
            >
              Забронировать →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
