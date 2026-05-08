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

interface TourBookingWidgetProps {
  tour: Tour;
}

export default function TourBookingWidget({ tour }: TourBookingWidgetProps) {
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
    setCartModalOpen,
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

  // ── Guide locking ──
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

  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set(cartKeys || []);
    reqKeys.forEach(k => s.add(k));
    return applyConditional(s);
  });

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

  const getTicketTotal = (key: string): number => {
    const row = PRICE_MAP[key];
    const tc = ticketCounts[key] || {};
    if (row?.classOptions?.length) {
      return row.classOptions.reduce(
        (sum: number, cls) =>
          sum +
          Object.values((tc[cls.label] || {}) as Record<string, number>).reduce(
            (a: number, b: number) => a + b, 0),
        0,
      );
    }
    return Object.values(tc as Record<string, number>).reduce(
      (s: number, n: number) => s + n, 0);
  };

  const getTicketPrice = (key: string): number => {
    const row = PRICE_MAP[key];
    const tc = ticketCounts[key] || {};
    if (row?.classOptions?.length) {
      return row.classOptions.reduce(
        (sum: number, cls) =>
          sum +
          (cls.ticketTiers || []).reduce(
            (s: number, tier) =>
              s + (tier.price || 0) * (((tc[cls.label] || {})[tier.label]) || 0), 0),
        0,
      );
    }
    return (row?.ticketTiers || []).reduce(
      (s: number, tier) => s + (tier.price || 0) * (tc[tier.label] || 0), 0);
  };

  const setTierCount = (key: string, tierLabel: string, delta: number) => {
    setTicketCounts(tc => {
      const prev = tc[key] || {};
      const maxVal = maxForTierLabel(tierLabel, groupSize);
      const alreadyInOthers = variants
        .filter(k => k !== key && PRICE_MAP[k]?.pricingType === 'tickets' && !PRICE_MAP[k]?.classOptions)
        .reduce((sum, k) => sum + ((tc[k] || {})[tierLabel] || 0), 0);
      const maxForThis = Math.max(0, maxVal - alreadyInOthers);
      const newCount = Math.max(0, Math.min(maxForThis, (prev[tierLabel] || 0) + delta));
      const newForKey = { ...prev, [tierLabel]: newCount };
      const total = Object.values(newForKey as Record<string, number>).reduce(
        (s: number, n: number) => s + n, 0);
      setSelected(s => {
        const ns = new Set(s);
        total > 0 ? ns.add(key) : ns.delete(key);
        return ns;
      });
      return { ...tc, [key]: newForKey };
    });
  };

  const setClassTierCount = (key: string, classLabel: string, tierLabel: string, delta: number) => {
    setTicketCounts(tc => {
      const row = PRICE_MAP[key];
      const classCounts = (tc[key]?.[classLabel]) || {};
      const maxVal = maxForTierLabel(tierLabel, groupSize);
      const alreadyInOtherClasses = (row?.classOptions || [])
        .filter(c => c.label !== classLabel)
        .reduce((sum, c) => sum + ((tc[key]?.[c.label]?.[tierLabel]) || 0), 0);
      const maxForThis = Math.max(0, maxVal - alreadyInOtherClasses);
      const newCount = Math.max(0, Math.min(maxForThis, (classCounts[tierLabel] || 0) + delta));
      const newClassCounts = { ...classCounts, [tierLabel]: newCount };
      const allTotal = (row?.classOptions || []).reduce((sum, c) => {
        const cc = c.label === classLabel ? newClassCounts : (tc[key]?.[c.label]) || {};
        return sum + Object.values(cc as Record<string, number>).reduce(
          (a: number, b: number) => a + b, 0);
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
    if (reqKeys.includes(key)) return;
    if (guideLockedMsg(key)) return;
    setSelected(s => {
      const next = new Set(s);
      next.has(key) ? next.delete(key) : next.add(key);
      if (!condKeys.includes(key)) {
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

  // Price display
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
        return s + getCartItemPrice(
          { id: '', tourId: tour.id, variantKey: key },
          groupSize, PRICE_MAP, tours);
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

  const handleCart = () => {
    if (isMulti || hasTickets) {
      applyVariantSelection(tour, selected, ticketCounts);
    } else {
      toggleSingleCart(tour, variants[0] || null);
    }
  };

  const handleBook = () => {
    // Add to cart first if not already
    if (isMulti || hasTickets) {
      if (count > 0) applyVariantSelection(tour, selected, ticketCounts);
    } else if (!inCart) {
      toggleSingleCart(tour, variants[0] || null);
    }
    setCartModalOpen(true);
  };

  const cartBtnLabel = isMulti
    ? count > 0
      ? `+ Заказать ${count} ${count === 1 ? 'позицию' : count < 5 ? 'позиции' : 'позиций'}`
      : inCart ? 'Убрать из тура' : '+ Заказать'
    : inCart ? '✓ В туре — убрать' : '+ Заказать';

  const cartBtnFilled = isMulti ? (count > 0 || inCart) : inCart;

  // ── Render helpers ──

  const renderCheckboxRow = (key: string, pd: PriceRow, colorScheme: 'standard' | 'optional' | 'conditional') => {
    const isSel = selected.has(key);
    const lockMsg = guideLockedMsg(key);
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
        border: isSel ? '2px solid #3b82f6' : '1.5px dashed rgba(59,130,246,0.4)',
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
          padding: '10px 12px',
          marginBottom: 6,
          borderRadius: 4,
          cursor: lockMsg ? 'not-allowed' : 'pointer',
          border: lockMsg ? '1px solid rgba(13,31,53,0.07)' : cs.border,
          background: lockMsg ? 'rgba(13,31,53,0.03)' : cs.bg,
          opacity: lockMsg ? 0.7 : 1,
          display: 'flex',
          flexDirection: 'column' as const,
          gap: 0,
          transition: 'all 140ms',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: colorScheme === 'conditional' ? 'flex-start' : 'center' }}>
          <div style={{
            width: 16, height: 16, borderRadius: 2, flexShrink: 0,
            marginTop: colorScheme === 'conditional' ? 2 : 0,
            border: lockMsg ? '2px solid rgba(13,31,53,0.12)' : cs.cbBorder,
            background: lockMsg ? 'rgba(13,31,53,0.07)' : cs.cbBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 120ms',
          }}>
            {lockMsg
              ? <span style={{ fontSize: 8, lineHeight: 1 }}>🔒</span>
              : isSel ? <span style={{ color: '#fff', fontSize: 9, lineHeight: 1 }}>✓</span> : null}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Lora',serif", fontSize: 12, fontWeight: isSel ? 600 : 500,
              color: lockMsg ? '#9e8e76' : cs.nameColor, lineHeight: 1.4,
            }}>{pd.name}</div>
            {colorScheme === 'conditional' && !lockMsg && svcRules[key]?.requiredWhen?.length! > 0 && (
              <div style={{ fontFamily: "'Lora',serif", fontSize: 9, color: '#7c3aed', marginTop: 2, lineHeight: 1.45 }}>
                обязательна при: {condTriggerNames(svcRules[key]?.requiredWhen)}
              </div>
            )}
            {!lockMsg && pd.desc && (
              <div style={{ fontFamily: "'Lora',serif", fontSize: 9, color: '#9e8e76', marginTop: 2, lineHeight: 1.5 }}>{pd.desc}</div>
            )}
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
            <div style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 17, fontWeight: 500,
              color: lockMsg ? '#9e8e76' : cs.priceColor, lineHeight: 1,
            }}>{rowDisplayPrice(pd)}</div>
            <div style={{
              fontFamily: "'Lora',serif", fontSize: 8, color: lockMsg ? '#9e8e76' : cs.noteColor, marginTop: 2,
            }}>{rowNote(pd)}</div>
          </div>
        </div>
        {lockMsg && (
          <div style={{
            marginTop: 6, marginLeft: 26, fontFamily: "'Lora',serif", fontSize: 9, color: '#b45309',
            lineHeight: 1.55, background: 'rgba(251,191,36,0.12)', borderRadius: 3, padding: '4px 7px',
            border: '1px solid rgba(251,191,36,0.3)',
          }}>{lockMsg}</div>
        )}
        {!lockMsg && pd.disclaimer && (
          <div style={{
            fontFamily: "'Lora',serif", fontSize: 9, color: 'rgba(13,31,53,0.38)', fontStyle: 'italic',
            lineHeight: 1.45, marginTop: 3, marginLeft: 26,
          }}>{pd.disclaimer}</div>
        )}
      </div>
    );
  };

  const renderTicketRow = (key: string, pd: PriceRow, colorScheme: 'standard' | 'optional') => {
    const total = getTicketTotal(key);
    const tprice = getTicketPrice(key);
    const isOpt = colorScheme === 'optional';
    const accentColor = isOpt ? '#1d4ed8' : '#0d1f35';
    const accentLight = isOpt ? 'rgba(29,78,216,0.1)' : 'rgba(13,31,53,0.08)';
    const borderActive = isOpt ? '2px solid #3b82f6' : '2px solid #c4703f';
    const borderInactive = isOpt ? '1.5px dashed rgba(59,130,246,0.4)' : '1px solid rgba(13,31,53,0.09)';
    const bgActive = isOpt ? '#eff6ff' : '#fff7ed';
    const bgInactive = isOpt ? 'rgba(239,246,255,0.4)' : '#fff';
    const nameColor = isOpt ? '#1e40af' : '#0d1f35';
    const descColor = isOpt ? '#6b7280' : '#9e8e76';
    const cntColor = isOpt ? '#1e40af' : '#0d1f35';
    const borderLeftActive = isOpt ? '2px solid #3b82f6' : '2px solid #c4703f';
    const borderLeftInactive = isOpt ? '2px solid rgba(59,130,246,0.2)' : '2px solid rgba(13,31,53,0.1)';
    const classLabelColor = isOpt ? '#1d4ed8' : '#c4703f';
    const classLabelInactive = isOpt ? '#6b7280' : '#9e8e76';
    const tierLabelColor = isOpt ? '#374151' : '#5c5040';
    const tierPriceColor = isOpt ? '#6b7280' : '#9e8e76';

    if (pd.classOptions?.length) {
      const minP = Math.min(
        ...pd.classOptions.flatMap(c => (c.ticketTiers || []).map(t => t.price || 0)).filter(p => p > 0), 0);
      return (
        <div key={key} style={{
          padding: '10px 12px', marginBottom: 6, borderRadius: 4,
          border: total > 0 ? borderActive : borderInactive,
          background: total > 0 ? bgActive : bgInactive,
          display: 'flex', flexDirection: 'column' as const, gap: 8, transition: 'all 140ms',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>🎫</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Lora',serif", fontSize: 12, fontWeight: total > 0 ? 600 : 500, color: nameColor, lineHeight: 1.4 }}>{pd.name}</div>
              {pd.desc && <div style={{ fontFamily: "'Lora',serif", fontSize: 9, color: descColor, marginTop: 2 }}>{pd.desc}</div>}
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
              <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 16, fontWeight: 500, color: nameColor, lineHeight: 1 }}>
                {total > 0 ? `$${tprice}` : minP > 0 ? `от $${minP}` : '—'}
              </div>
            </div>
          </div>
          {pd.classOptions.map(cls => {
            const classTotal = Object.values((ticketCounts[key]?.[cls.label] || {}) as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
            return (
              <div key={cls.label} style={{ marginLeft: 24, paddingLeft: 10, borderLeft: classTotal > 0 ? borderLeftActive : borderLeftInactive }}>
                <div style={{ fontFamily: "'Lora',serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: classTotal > 0 ? classLabelColor : classLabelInactive, marginBottom: 5 }}>
                  {cls.label}
                  {classTotal > 0 && <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, marginLeft: 5, color: classLabelColor }}>(выбрано {classTotal})</span>}
                </div>
                {(cls.ticketTiers || []).map(tier => {
                  const cnt = (ticketCounts[key]?.[cls.label]?.[tier.label]) || 0;
                  return (
                    <div key={tier.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Lora',serif", fontSize: 10, color: tierLabelColor, flex: 1 }}>
                        {tier.label}{tier.ageFrom !== undefined && tier.ageTo !== undefined ? ` (${tier.ageFrom}–${tier.ageTo} л.)` : ''}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <button onClick={e => { e.stopPropagation(); setClassTierCount(key, cls.label, tier.label, -1); }}
                          style={{ width: 20, height: 20, borderRadius: '50%', background: cnt > 0 ? accentColor : accentLight, border: 'none', cursor: cnt > 0 ? 'pointer' : 'default', color: cnt > 0 ? '#f8f5f0' : '#9e8e76', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms' }}>−</button>
                        <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 14, fontWeight: 500, color: cntColor, minWidth: 20, textAlign: 'center' as const }}>{cnt}</span>
                        <button onClick={e => { e.stopPropagation(); setClassTierCount(key, cls.label, tier.label, +1); }}
                          style={{ width: 20, height: 20, borderRadius: '50%', background: accentColor, border: 'none', cursor: 'pointer', color: isOpt ? '#fff' : '#f8f5f0', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                      <span style={{ fontFamily: "'Lora',serif", fontSize: 10, color: tierPriceColor, minWidth: 56, textAlign: 'right' as const }}>${tier.price || 0}/чел.</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {pd.disclaimer && (
            <div style={{ fontFamily: "'Lora',serif", fontSize: 9, color: 'rgba(13,31,53,0.38)', fontStyle: 'italic', lineHeight: 1.45, paddingTop: 2 }}>{pd.disclaimer}</div>
          )}
        </div>
      );
    }

    // Flat format
    const minP = Math.min(...(pd.ticketTiers || []).map(t => t.price || 0).filter(p => p > 0), 0);
    return (
      <div key={key} style={{
        padding: '10px 12px', marginBottom: 6, borderRadius: 4,
        border: total > 0 ? borderActive : borderInactive,
        background: total > 0 ? bgActive : bgInactive,
        display: 'flex', flexDirection: 'column' as const, gap: 6, transition: 'all 140ms',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>🎫</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Lora',serif", fontSize: 12, fontWeight: total > 0 ? 600 : 500, color: nameColor, lineHeight: 1.4 }}>{pd.name}</div>
            {pd.desc && <div style={{ fontFamily: "'Lora',serif", fontSize: 9, color: descColor, marginTop: 2 }}>{pd.desc}</div>}
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
            <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 16, fontWeight: 500, color: nameColor, lineHeight: 1 }}>
              {total > 0 ? `$${tprice}` : minP > 0 ? `от $${minP}` : '—'}
            </div>
          </div>
        </div>
        {(pd.ticketTiers || []).map(tier => {
          const cnt = (ticketCounts[key] || {})[tier.label] || 0;
          return (
            <div key={tier.label} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 24 }}>
              <span style={{ fontFamily: "'Lora',serif", fontSize: 10, color: tierLabelColor, flex: 1 }}>
                {tier.label}{tier.ageFrom !== undefined && tier.ageTo !== undefined ? ` (${tier.ageFrom}–${tier.ageTo} лет)` : ''}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <button onClick={e => { e.stopPropagation(); setTierCount(key, tier.label, -1); }}
                  style={{ width: 20, height: 20, borderRadius: '50%', background: cnt > 0 ? accentColor : accentLight, border: 'none', cursor: cnt > 0 ? 'pointer' : 'default', color: cnt > 0 ? '#f8f5f0' : '#9e8e76', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms' }}>−</button>
                <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 14, fontWeight: 500, color: cntColor, minWidth: 20, textAlign: 'center' as const }}>{cnt}</span>
                <button onClick={e => { e.stopPropagation(); setTierCount(key, tier.label, +1); }}
                  style={{ width: 20, height: 20, borderRadius: '50%', background: accentColor, border: 'none', cursor: 'pointer', color: isOpt ? '#fff' : '#f8f5f0', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <span style={{ fontFamily: "'Lora',serif", fontSize: 10, color: tierPriceColor, minWidth: 56, textAlign: 'right' as const }}>${tier.price || 0}/чел.</span>
            </div>
          );
        })}
        {pd.disclaimer && (
          <div style={{ fontFamily: "'Lora',serif", fontSize: 9, color: 'rgba(13,31,53,0.38)', fontStyle: 'italic', lineHeight: 1.45, paddingTop: 2 }}>{pd.disclaimer}</div>
        )}
      </div>
    );
  };

  const renderVariantKeys = (keys: string[], colorScheme: 'standard' | 'optional') =>
    keys.map(key => {
      const pd = PRICE_MAP[key];
      if (!pd) return null;
      if (pd.pricingType === 'tickets') return renderTicketRow(key, pd, colorScheme);
      return renderCheckboxRow(key, pd, colorScheme);
    });

  // ── Render ──
  return (
    <div style={{ background: '#f8f5f0', borderRadius: 4, border: '1px solid rgba(13,31,53,0.1)', padding: 16, position: 'sticky', top: 80 }}>
      {/* Group size pickers */}
      <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(13,31,53,0.09)' }}>
        <div style={{ fontFamily: "'Lora',serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9e8e76', marginBottom: 10 }}>
          Участники
        </div>

        {/* Adults */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: "'Lora',serif", fontSize: 11, color: '#5c5040' }}>Взрослых</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <button onClick={() => {
              const a = groupSize.adults || 0, c = groupSize.children || 0;
              if (a > 0 && !(a === 1 && c > 0)) setGroupSize({ ...groupSize, adults: a - 1 });
            }}
              style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: (groupSize.adults || 0) > 0 && !((groupSize.adults || 0) === 1 && (groupSize.children || 0) > 0) ? '#0d1f35' : 'rgba(13,31,53,0.1)',
                color: (groupSize.adults || 0) > 0 && !((groupSize.adults || 0) === 1 && (groupSize.children || 0) > 0) ? '#f8f5f0' : '#9e8e76',
                fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms' }}>−</button>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, fontWeight: 500, color: '#0d1f35', minWidth: 20, textAlign: 'center', lineHeight: 1 }}>{groupSize.adults || 0}</span>
            <button onClick={() => setGroupSize({ ...groupSize, adults: (groupSize.adults || 0) + 1 })}
              style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#0d1f35', color: '#f8f5f0', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        </div>

        {/* Children */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: "'Lora',serif", fontSize: 11, color: '#5c5040' }}>Детей</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <button onClick={() => (groupSize.children || 0) > 0 && setGroupSize({ ...groupSize, children: (groupSize.children || 0) - 1 })}
              style={{ width: 22, height: 22, borderRadius: '50%', border: 'none',
                cursor: (groupSize.children || 0) > 0 ? 'pointer' : 'default',
                background: (groupSize.children || 0) > 0 ? '#0d1f35' : 'rgba(13,31,53,0.1)',
                color: (groupSize.children || 0) > 0 ? '#f8f5f0' : '#9e8e76',
                fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms' }}>−</button>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, fontWeight: 500, color: '#0d1f35', minWidth: 20, textAlign: 'center', lineHeight: 1 }}>{groupSize.children || 0}</span>
            <button onClick={() => (groupSize.adults || 0) > 0 && setGroupSize({ ...groupSize, children: (groupSize.children || 0) + 1 })}
              style={{ width: 22, height: 22, borderRadius: '50%',
                border: (groupSize.adults || 0) > 0 ? 'none' : '1.5px dashed rgba(13,31,53,0.3)',
                cursor: (groupSize.adults || 0) > 0 ? 'pointer' : 'not-allowed',
                background: (groupSize.adults || 0) > 0 ? '#0d1f35' : 'rgba(13,31,53,0.15)',
                color: (groupSize.adults || 0) > 0 ? '#f8f5f0' : '#9e8e76',
                fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms' }}>+</button>
          </div>
        </div>

        {/* Days */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Lora',serif", fontSize: 11, color: '#5c5040' }}>Дней</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <button onClick={() => setGroupSize({ ...groupSize, days: Math.max(1, (groupSize.days || 1) - 1) })}
              style={{ width: 22, height: 22, borderRadius: '50%', border: 'none',
                cursor: (groupSize.days || 1) > 1 ? 'pointer' : 'default',
                background: (groupSize.days || 1) > 1 ? '#0d1f35' : 'rgba(13,31,53,0.1)',
                color: (groupSize.days || 1) > 1 ? '#f8f5f0' : '#9e8e76',
                fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms' }}>−</button>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, fontWeight: 500, color: '#0d1f35', minWidth: 20, textAlign: 'center', lineHeight: 1 }}>{groupSize.days || 1}</span>
            <button onClick={() => setGroupSize({ ...groupSize, days: (groupSize.days || 1) + 1 })}
              style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#0d1f35', color: '#f8f5f0', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        </div>

        {(groupSize.adults || 0) === 0 && (
          <div style={{ fontFamily: "'Lora',serif", fontSize: 9, color: '#b45309', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 3, padding: '3px 7px', lineHeight: 1.4, marginTop: 8 }}>
            добавьте взрослого
          </div>
        )}
      </div>

      {/* Variants / options */}
      {(isMulti || hasTickets) && (
        <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(13,31,53,0.09)' }}>
          <div style={{ fontFamily: "'Lora',serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9e8e76', marginBottom: 6 }}>
            {hasRules ? 'Состав тура' : 'Выберите варианты'}
          </div>

          {/* Required */}
          {reqKeys.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              {hasRules && (
                <div style={{ fontFamily: "'Lora',serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b45309', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                  🔒 Обязательно
                </div>
              )}
              {reqKeys.map(key => {
                const pd = PRICE_MAP[key];
                if (!pd) return null;
                return (
                  <div key={key} style={{
                    padding: '8px 12px', marginBottom: 5, borderRadius: 4,
                    border: '1.5px solid #fbbf24', background: '#fefce8',
                    display: 'flex', gap: 10, alignItems: 'center', cursor: 'default',
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: 2, background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: 8, lineHeight: 1 }}>🔒</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Lora',serif", fontSize: 12, fontWeight: 600, color: '#92400e', lineHeight: 1.4 }}>{pd.name}</div>
                      {pd.desc && <div style={{ fontFamily: "'Lora',serif", fontSize: 9, color: '#b45309', marginTop: 2, lineHeight: 1.5 }}>{pd.desc}</div>}
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 17, fontWeight: 500, color: '#92400e', lineHeight: 1 }}>{rowDisplayPrice(pd)}</div>
                      <div style={{ fontFamily: "'Lora',serif", fontSize: 8, color: '#b45309', marginTop: 2 }}>{rowNote(pd)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Standard */}
          {stdKeys.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              {hasRules && <div style={{ fontFamily: "'Lora',serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9e8e76', marginBottom: 5, marginTop: reqKeys.length ? 8 : 0 }}>В составе тура</div>}
              {renderVariantKeys(stdKeys, 'standard')}
            </div>
          )}

          {/* Conditional */}
          {condKeys.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontFamily: "'Lora',serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 5, marginTop: 8 }}>
                ⟶ Зависит от выбора
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
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed rgba(13,31,53,0.12)' }}>
              <div style={{ fontFamily: "'Lora',serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1d4ed8', marginBottom: 5 }}>
                + Можно добавить
              </div>
              {renderVariantKeys(optKeys, 'optional')}
            </div>
          )}
        </div>
      )}

      {/* Price display */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 28, fontWeight: 500, color: '#0d1f35', lineHeight: 1 }}>
          {displayPrice}
        </div>
        {displayNote && (
          <div style={{ fontFamily: "'Lora',serif", fontSize: 11, color: '#9e8e76', marginTop: 3 }}>
            {displayNote}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={handleCart} style={{
          fontFamily: "'Lora',serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', padding: '12px 0', borderRadius: 2,
          border: cartBtnFilled ? 'none' : '1px solid rgba(196,112,63,0.5)',
          cursor: 'pointer', width: '100%',
          background: cartBtnFilled ? '#c4703f' : 'transparent',
          color: cartBtnFilled ? '#f8f5f0' : '#c4703f',
          transition: 'all 180ms', textAlign: 'center',
        }}>
          {cartBtnLabel}
        </button>
        <button onClick={handleBook} style={{
          fontFamily: "'Lora',serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: '12px 0', borderRadius: 2,
          border: 'none', cursor: 'pointer', width: '100%',
          background: '#0d1f35', color: '#f8f5f0', textAlign: 'center',
        }}>
          Забронировать &rarr;
        </button>
      </div>

      {/* Meeting point */}
      {tour.meetingPoint && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(13,31,53,0.08)' }}>
          <div style={{ fontFamily: "'Lora',serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9e8e76', marginBottom: 4 }}>
            Место встречи
          </div>
          <div style={{ fontFamily: "'Lora',serif", fontSize: 12, color: '#2a2520' }}>
            {tour.meetingPoint}
          </div>
        </div>
      )}
    </div>
  );
}
