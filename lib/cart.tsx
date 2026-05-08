'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { content } from '@/lib/content';
import {
  buildPriceMap,
  getCartItemPrice,
  isGuideRow,
  makeCartId,
  formatDuration,
  pricingTag,
  type PriceMap,
} from '@/lib/pricing';
import type { CartItem, GroupSize, Tour, TicketCounts } from '@/types';

// ─── Build the price map once ────────────────────────────────────────────────

const PRICE_MAP: PriceMap = buildPriceMap(content.prices);
const TOURS: Tour[] = content.tours;

// ─── Context types ──────────────────────────────────────────────────────────

interface CartContextType {
  cart: CartItem[];
  groupSize: GroupSize;
  setGroupSize: (gs: GroupSize) => void;
  priceMap: PriceMap;
  tours: Tour[];
  cartTotal: number;
  cartTotalHours: number;
  timeOverload: boolean;
  guideConflict: boolean;
  guidesInOtherTours: (excludeTourId: number) => number;
  toggleSingleCart: (tour: Tour, variantKey: string | null) => void;
  applyVariantSelection: (
    tour: Tour,
    selectedKeys: Set<string>,
    tcounts?: Record<string, TicketCounts>,
  ) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  cartKeysForTour: (tourId: number) => Set<string>;
  cartCountForTour: (tourId: number) => number;
  cartTicketCountsForTour: (tourId: number) => Record<string, TicketCounts>;
  // Cart modal state
  cartModalOpen: boolean;
  setCartModalOpen: (open: boolean) => void;
  form: { name: string; contact: string; arrival: string; departure: string; comment: string };
  setForm: (form: any) => void;
  submitted: boolean;
  setSubmitted: (v: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [groupSize, setGroupSize] = useState<GroupSize>({ adults: 2, children: 0, days: 1 });
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', arrival: '', departure: '', comment: '' });
  const [submitted, setSubmitted] = useState(false);

  // Cart keys for a specific tour
  const cartKeysForTour = useCallback(
    (tourId: number) =>
      new Set(
        cart
          .filter(i => i.tourId === tourId)
          .map(i => i.variantKey)
          .filter((k): k is string => Boolean(k)),
      ),
    [cart],
  );

  const cartCountForTour = useCallback(
    (tourId: number) => cart.filter(i => i.tourId === tourId).length,
    [cart],
  );

  // Ticket counts for a tour (for ticket-based items)
  const cartTicketCountsForTour = useCallback(
    (tourId: number) => {
      const result: Record<string, TicketCounts> = {};
      cart
        .filter(i => i.tourId === tourId && i.ticketCounts)
        .forEach(i => {
          if (i.variantKey && i.ticketCounts) {
            result[i.variantKey] = i.ticketCounts;
          }
        });
      return result;
    },
    [cart],
  );

  // Toggle single cart item (tours without variants or with 1 variant)
  const toggleSingleCart = useCallback((tour: Tour, variantKey: string | null) => {
    const id = makeCartId(tour.id, variantKey || undefined);
    setCart(c =>
      c.some(i => i.id === id)
        ? c.filter(i => i.id !== id)
        : [...c, { id, tourId: tour.id, variantKey: variantKey || undefined }],
    );
  }, []);

  // Apply multi-select from VariantPicker / TourModal: replace all items for this tour
  const applyVariantSelection = useCallback(
    (tour: Tour, selectedKeys: Set<string>, tcounts: Record<string, TicketCounts> = {}) => {
      setCart(prev => {
        const keep = prev.filter(i => i.tourId !== tour.id);
        const add: CartItem[] = Array.from(selectedKeys).map(key => ({
          id: makeCartId(tour.id, key),
          tourId: tour.id,
          variantKey: key,
          ticketCounts: tcounts[key] || undefined,
        }));
        return [...keep, ...add];
      });
    },
    [],
  );

  // Remove a specific item by id
  const removeCartItem = useCallback((id: string) => {
    setCart(c => c.filter(i => i.id !== id));
  }, []);

  // Clear all items
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Computed cart data
  const cartData = useMemo(() => {
    const items = cart
      .map(item => {
        const tour = TOURS.find(t => t.id === item.tourId);
        if (!tour) return null;
        const pd = item.variantKey ? PRICE_MAP[item.variantKey] : null;
        const price = getCartItemPrice(item, groupSize, PRICE_MAP, TOURS);
        const tag = pricingTag(item, groupSize, PRICE_MAP, TOURS);
        const name = pd?.name || tour.title;
        const note = pd?.note || (tour.priceModel === 'person' ? 'за чел.' : 'до 3 чел.');
        return { item, tour, name, price, tag, note };
      })
      .filter(Boolean) as Array<{
      item: CartItem;
      tour: Tour;
      name: string;
      price: number;
      tag: string;
      note: string;
    }>;

    const cartTotal = items.reduce((s, r) => s + r.price, 0);
    const cartTotalHours = items.reduce((s, r) => s + (r.tour.durationHours || 0), 0);

    const days = groupSize.days || 1;
    const hoursPerDay = 9;
    const timeOverload = cartTotalHours > 0 && cart.length > 1 && cartTotalHours > days * hoursPerDay;

    // Guide items count
    const guideItemsCount = cart.filter(item => {
      const row = item.variantKey ? PRICE_MAP[item.variantKey] : null;
      return isGuideRow(row);
    }).length;
    const guideConflict = guideItemsCount > days;

    return { cartTotal, cartTotalHours, timeOverload, guideConflict };
  }, [cart, groupSize]);

  // Guides in other tours (excluding a specific tour)
  const guidesInOtherTours = useCallback(
    (excludeTourId: number) =>
      cart.filter(item => {
        if (item.tourId === excludeTourId) return false;
        const row = item.variantKey ? PRICE_MAP[item.variantKey] : null;
        return isGuideRow(row);
      }).length,
    [cart],
  );

  const value: CartContextType = {
    cart,
    groupSize,
    setGroupSize,
    priceMap: PRICE_MAP,
    tours: TOURS,
    cartTotal: cartData.cartTotal,
    cartTotalHours: cartData.cartTotalHours,
    timeOverload: cartData.timeOverload,
    guideConflict: cartData.guideConflict,
    guidesInOtherTours,
    toggleSingleCart,
    applyVariantSelection,
    removeCartItem,
    clearCart,
    cartKeysForTour,
    cartCountForTour,
    cartTicketCountsForTour,
    cartModalOpen,
    setCartModalOpen,
    form,
    setForm,
    submitted,
    setSubmitted,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
