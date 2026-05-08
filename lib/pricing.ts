// ─── Magellania Design System — Pricing utilities ───────────────────────────
// Extracted from TourCard.jsx, converted to TypeScript ES modules.
// Logic preserved exactly as in the SPA source.

import type {
  Tour,
  PriceRow,
  PriceTab,
  Prices,
  GroupSize,
  CartItem,
  TicketCounts,
  FlatTicketCounts,
  NestedTicketCounts,
} from '@/types';

// ─── Price map ───────────────────────────────────────────────────────────────

export type PriceMap = Record<string, PriceRow>;

/**
 * Builds a lookup map from content.prices: key -> PriceRow.
 * Iterates all tabs and indexes rows by their `key` field.
 */
export function buildPriceMap(prices: Prices): PriceMap {
  const map: PriceMap = {};
  prices.tabs.forEach((tab: PriceTab) => {
    const rows = prices[tab.id];
    if (!Array.isArray(rows)) return;
    (rows as PriceRow[]).forEach((row: PriceRow) => {
      const key = row.key || (row as any)[4]; // support legacy array format
      if (key) map[key] = row;
    });
  });
  return map;
}

// ─── Display helpers ─────────────────────────────────────────────────────────

/** Formatted display price for a price row (used in VariantPicker and cards) */
export function rowDisplayPrice(row: PriceRow | null | undefined): string {
  if (!row) return '—';
  if (row.pricingType === 'person') return `$${row.pricePerPerson} / чел.`;
  if (row.pricingType === 'fixed') {
    if (!row.priceFixed) return 'Бесплатно';
    return `$${row.priceFixed}`;
  }
  if (row.pricingType === 'tickets') {
    // classOptions: combine prices from all classes
    if (row.classOptions?.length) {
      const prices = row.classOptions
        .flatMap(c => (c.ticketTiers || []).map(t => t.price))
        .filter(p => p > 0);
      if (!prices.length) return '🎫 —';
      return `🎫 от $${Math.min(...prices)}/чел.`;
    }
    if (row.ticketTiers?.length) {
      const prices = row.ticketTiers.map(t => t.price).filter(p => p > 0);
      if (!prices.length) return '🎫 —';
      return `🎫 от $${Math.min(...prices)}/чел.`;
    }
  }
  if (row.pricingType === 'group' && row.tiers && row.tiers.length) {
    const prices = row.tiers.map(t => t.price);
    const mn = Math.min(...prices);
    const mx = Math.max(...prices);
    return mn === mx ? `$${mn}` : `$${mn}–${mx}`;
  }
  // Legacy array format fallback
  return ((row as any)[3] as string) || '—';
}

/** Note text for a price row */
export function rowNote(row: PriceRow | null | undefined): string {
  if (!row) return '';
  if (row.pricingType === 'person') return 'за чел.';
  if (row.pricingType === 'fixed') return 'фиксировано';
  if (row.pricingType === 'tickets') return 'билеты';
  if (row.pricingType === 'group') return 'за группу';
  return ((row as any)[1] as string) || '';
}

// ─── Guide detection ─────────────────────────────────────────────────────────

/**
 * Checks if a price row is a standalone guide service (not a transfer+guide package).
 */
export function isGuideRow(row: PriceRow | null | undefined): boolean {
  if (!row) return false;
  // If explicitly marked as another type, not a guide
  if (row.serviceType && row.serviceType !== 'guide') return false;
  const name = (row.name || '').toLowerCase();
  const key = (row.key || '').toLowerCase();
  // Package with transfer is not a pure guide
  if (/трансфер|transfer/.test(name + ' ' + key)) return false;
  // Explicit guide flag from admin
  if (row.serviceType === 'guide') return true;
  // Heuristic by name/key
  return /гид|guide|сопровожд|русскоязычн/.test(name + ' ' + key);
}

// ─── Variant helpers ─────────────────────────────────────────────────────────

/** Get available variant keys for a tour */
export function getTourVariants(tour: Tour, _priceMap?: PriceMap): string[] {
  if (tour.priceVariants && tour.priceVariants.length > 0) return tour.priceVariants;
  if (tour.priceRef) return [tour.priceRef];
  return [];
}

// ─── Price parsing ───────────────────────────────────────────────────────────

/** Extracts the first number from a price string. Handles "$288-400" correctly. */
export function parsePrice(str: string | number | null | undefined): number | null {
  if (!str) return null;
  const match = String(str).match(/\d[\d,]*/);
  if (!match) return null;
  const n = parseInt(match[0].replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

// ─── Tier type matching ──────────────────────────────────────────────────────

export type TierType = 'adult' | 'child' | 'total';

/** Classifies a ticket tier label as adult/child/total */
export function matchTierType(label: string): TierType {
  const lc = (label || '').toLowerCase();
  if (/взрослый|взрослых|adult/.test(lc)) return 'adult';
  if (/детский|детей|ребёнок|дети|ребенок|child|infant/.test(lc)) return 'child';
  return 'total';
}

/** Max tickets for a tier type based on group size */
export function maxForTierLabel(label: string, gs: GroupSize | null | undefined): number {
  const t = matchTierType(label);
  if (t === 'adult') return (gs && gs.adults) || 0;
  if (t === 'child') return (gs && gs.children) || 0;
  return ((gs && gs.adults) || 0) + ((gs && gs.children) || 0);
}

/** Suggests initial ticket count for a tier */
export function suggestTierCount(tierLabel: string, gs: GroupSize | null | undefined): number {
  return maxForTierLabel(tierLabel, gs);
}

// ─── Cart helpers ────────────────────────────────────────────────────────────

/** Generates a unique cart item ID */
export function makeCartId(tourId: number, variantKey?: string): string {
  return variantKey ? `v:${tourId}:${variantKey}` : `t:${tourId}`;
}

// ─── Price calculation ───────────────────────────────────────────────────────

/**
 * Calculates the price for a cart item given group size.
 * Requires tours array for fallback to tour.priceBase.
 */
export function getCartItemPrice(
  item: CartItem,
  groupSize: GroupSize = { adults: 2, children: 0 },
  priceMap: PriceMap,
  tours: Tour[],
): number {
  const tour = tours.find(t => t.id === item.tourId);
  const row = item.variantKey ? priceMap[item.variantKey] : null;
  const total = ((groupSize && groupSize.adults) || 0) + ((groupSize && groupSize.children) || 0) || 1;

  if (row) {
    if (row.pricingType === 'person') return (row.pricePerPerson || 0) * total;
    if (row.pricingType === 'fixed') return row.priceFixed || 0;
    if (row.pricingType === 'tickets') {
      if (item.ticketCounts && Object.keys(item.ticketCounts).length > 0) {
        if (row.classOptions?.length) {
          // Nested format: { classLabel: { tierLabel: count } }
          const tc = item.ticketCounts as NestedTicketCounts;
          return row.classOptions.reduce(
            (sum, cls) =>
              sum +
              (cls.ticketTiers || []).reduce(
                (s, tier) => s + (tier.price || 0) * ((tc[cls.label]?.[tier.label]) || 0),
                0,
              ),
            0,
          );
        }
        const tc = item.ticketCounts as FlatTicketCounts;
        return (row.ticketTiers || []).reduce(
          (s, tier) => s + (tier.price || 0) * (tc[tier.label] || 0),
          0,
        );
      }
      // Fallback: min price * total
      const prices = row.classOptions?.length
        ? row.classOptions.flatMap(c => (c.ticketTiers || []).map(t => t.price || 0)).filter(p => p > 0)
        : (row.ticketTiers || []).map(t => t.price || 0).filter(p => p > 0);
      return prices.length ? Math.min(...prices) * total : 0;
    }
    if (row.pricingType === 'group' && row.tiers) {
      const tier =
        row.tiers.find(t => total >= t.min && total <= t.max) ||
        row.tiers[row.tiers.length - 1];
      return tier ? tier.price : 0;
    }
    // Legacy array format fallback
    const base = parsePrice((row as any)[3]) || 0;
    const note: string = (row as any)[1] || '';
    if (note.includes('за чел')) return base * total;
    const mult = total <= 3 ? 1 : total <= 6 ? 2 : total <= 9 ? 3 : 4;
    return base * mult;
  }

  // No price row linked — use tour.priceBase
  const base = tour?.priceBase || 0;
  if (tour?.priceModel === 'person') return base * total;
  const mult = total <= 3 ? 1 : total <= 6 ? 2 : total <= 9 ? 3 : 4;
  return base * mult;
}

/**
 * Returns the minimum "from $X" price string for a tour.
 */
export function getTourMinPrice(tour: Tour, priceMap: PriceMap): string {
  const variants = getTourVariants(tour);
  const rows = variants.map(k => priceMap[k]).filter(Boolean);
  if (!rows.length) return tour.price;

  const prices: number[] = [];
  rows.forEach(row => {
    if (row.pricingType === 'person') prices.push(row.pricePerPerson || 0);
    else if (row.pricingType === 'fixed') prices.push(row.priceFixed || 0);
    else if (row.pricingType === 'tickets' && row.classOptions?.length)
      prices.push(...row.classOptions.flatMap(c => (c.ticketTiers || []).map(t => t.price)));
    else if (row.pricingType === 'tickets' && row.ticketTiers)
      prices.push(...row.ticketTiers.map(t => t.price));
    else if (row.pricingType === 'group' && row.tiers) prices.push(...row.tiers.map(t => t.price));
    else prices.push(parsePrice((row as any)[3]) || 0);
  });

  const valid = prices.filter(p => p > 0);
  if (!valid.length) return tour.price;
  return 'от $' + Math.min(...valid).toLocaleString();
}

// ─── Pricing tag ─────────────────────────────────────────────────────────────

/**
 * Returns a pricing type tag string for a cart item.
 */
export function pricingTag(
  item: CartItem,
  groupSize: GroupSize,
  priceMap: PriceMap,
  tours: Tour[],
): string {
  const total = ((groupSize && groupSize.adults) || 0) + ((groupSize && groupSize.children) || 0) || 1;
  const row = item.variantKey ? priceMap[item.variantKey] : null;
  if (!row) {
    const t = tours.find(t => t.id === item.tourId);
    return t?.priceModel === 'person' ? `× ${total} чел.` : 'за группу';
  }
  if (row.pricingType === 'person') return `× ${total} чел.`;
  if (row.pricingType === 'fixed') return 'фиксировано';
  if (row.pricingType === 'tickets') {
    if (item.ticketCounts) {
      if (row.classOptions?.length) {
        // Nested format: { classLabel: { tierLabel: count } }
        const tc = item.ticketCounts as NestedTicketCounts;
        const parts = row.classOptions.flatMap(cls =>
          (cls.ticketTiers || [])
            .map(tier => ({
              label: `${cls.label} / ${tier.label}`,
              count: (tc[cls.label]?.[tier.label]) || 0,
            }))
            .filter(x => x.count > 0)
            .map(x => `${x.count} × ${x.label}`),
        );
        return parts.length ? parts.join(' + ') : '—';
      }
      const tc = item.ticketCounts as FlatTicketCounts;
      const parts = (row.ticketTiers || [])
        .map(tier => ({ label: tier.label, count: tc[tier.label] || 0 }))
        .filter(x => x.count > 0)
        .map(x => `${x.count} × ${x.label}`);
      return parts.length ? parts.join(' + ') : '—';
    }
    return `${total} билетов`;
  }
  if (row.pricingType === 'group' && row.tiers) {
    const tier =
      row.tiers.find(t => total >= t.min && total <= t.max) ||
      row.tiers[row.tiers.length - 1];
    return tier ? `${tier.min}–${tier.max} чел.` : 'за группу';
  }
  return 'за группу';
}

// ─── Duration formatting ─────────────────────────────────────────────────────

/** Formats duration in hours to a human-readable Russian string */
export function formatDuration(totalHours: number): string {
  if (totalHours < 1) return `${Math.round(totalHours * 60)} мин`;
  const h = Math.floor(totalHours);
  const m = Math.round((totalHours - h) * 60);
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}
