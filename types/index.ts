// ─── Magellania Design System — TypeScript types ────────────────────────────
// Based on content.json data structure

// ─── Primitives & shared ─────────────────────────────────────────────────────

export interface GalleryItem {
  file: string;
  alt: string;
}

/** Backward-compatible gallery entry: object or plain filename string */
export type GalleryEntry = GalleryItem | string;

export interface ProgramStep {
  time: string;
  text: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export type PricingType = 'fixed' | 'person' | 'group' | 'tickets';

export interface GroupTier {
  min: number;
  max: number;
  price: number;
}

export interface TicketTier {
  label: string;
  ageFrom?: number;
  ageTo?: number;
  price: number;
}

export interface ClassOption {
  label: string;
  ticketTiers: TicketTier[];
}

export interface ServiceRuleEntry {
  state: 'required' | 'optional' | 'conditional' | 'default';
  requiredWhen: string[];
}

export interface PriceRow {
  key?: string;
  name: string;
  duration?: string;
  pricingType: PricingType;
  priceFixed?: number;
  pricePerPerson?: number;
  tiers?: GroupTier[];
  ticketTiers?: TicketTier[];
  classOptions?: ClassOption[];
  note?: string;
  desc?: string;
  disclaimer?: string;
  serviceType?: string;
  _collapsed?: boolean;
  // Legacy array format fallback fields (index-based)
  [index: number]: string | number | undefined;
}

export interface PriceTab {
  id: string;
  label: string;
}

export interface PriceRegion {
  id: string;
  label: string;
}

export interface Prices {
  eyebrow: string;
  heading: string;
  note: string;
  tabs: PriceTab[];
  regions: PriceRegion[];
  activeRegion: string;
  byRegion: Record<string, PriceRow[]>;
  tours: PriceRow[];
  guide: PriceRow[];
  transfers: PriceRow[];
  air: PriceRow[];
  [tabId: string]: PriceRow[] | PriceTab[] | PriceRegion[] | string | Record<string, PriceRow[]>;
}

// ─── Tour ────────────────────────────────────────────────────────────────────

export interface Tour {
  id: number;
  slug: string;
  category: string;
  title: string;
  duration: string;
  durationHours?: number;
  transport: string;
  maxGroup: string;
  desc: string;
  lead: string;
  lang: string;
  program: ProgramStep[];
  includes: string[];
  excludes: string[];
  meetingPoint: string;
  gallery: GalleryEntry[];
  metaTitle: string;
  metaDesc: string;
  schemaType: string;
  faq: FAQItem[];
  tags: string[];
  relatedPosts: string[];
  price: string;
  priceNote?: string;
  priceBase: number;
  priceModel: 'group' | 'person';
  priceRef?: string;
  priceVariants?: string[];
  season?: string;
  bg: string;
  overlay?: string;
  visible?: boolean;
  serviceRules?: Record<string, ServiceRuleEntry>;
  // Optional fields that may appear on some tours
  variants?: TourVariant[];
  meta?: Record<string, string>;
  childrenOk?: boolean;
  language?: string;
}

export interface TourVariant {
  key: string;
  label: string;
}

// ─── Blog ────────────────────────────────────────────────────────────────────

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  lead: string;
  body: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  relatedTours: string[];
  schemaType: string;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  name: string;
  experience: string;
  date: string;
  dateISO: string;
  rating: number;
  tour: string;
  tourShort: string;
  text: string;
  location?: string;
}

export interface ReviewsSection {
  eyebrow: string;
  heading: string;
  lead: string;
  items: Review[];
  aggregate: {
    count: number;
    rating: number;
    average?: number;
    avgGroupSize?: number;
  };
  cta: string | Record<string, string>;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

/** Flat ticket counts: { [tierLabel]: count } */
export type FlatTicketCounts = Record<string, number>;

/** Nested ticket counts for classOptions: { [classLabel]: { [tierLabel]: count } } */
export type NestedTicketCounts = Record<string, Record<string, number>>;

export type TicketCounts = FlatTicketCounts | NestedTicketCounts;

export interface GroupSize {
  adults: number;
  children: number;
  days?: number;
}

export interface CartItem {
  id: string;
  tourId: number;
  variantKey?: string;
  ticketCounts?: TicketCounts;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  page: string;
  hidden: boolean;
}

export interface Nav {
  links: NavLink[];
  cta: string;
}

// ─── Hero ────────────────────────────────────────────────────────────────────

export interface HeroStat {
  num: string;
  label: string;
}

export interface Hero {
  eyebrow: string;
  heading: string[];
  sub: string;
  cta1: string;
  cta2: string;
  stats: HeroStat[];
  bg: string;
  overlay: string;
}

// ─── Site ────────────────────────────────────────────────────────────────────

export interface Site {
  name: string;
  tagline: string;
  copyright: string;
}

// ─── Tours Section ───────────────────────────────────────────────────────────

export interface ToursSection {
  eyebrow: string;
  heading: string;
  sub: string;
  toggleB2C: string;
  toggleB2B: string;
  filters: string[];
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface ContactInfo {
  eyebrow: string;
  heading: string;
  sub: string;
  contacts: Record<string, string>[];
  form: Record<string, any>;
  success: { heading: string; text: string };
}

// ─── About ───────────────────────────────────────────────────────────────────

export interface About {
  eyebrow: string;
  heading: string;
  sub: string;
  p1?: string;
  p2?: string;
  quote?: string;
  team?: Record<string, string>[];
  stats?: { num: string; label: string }[];
  [key: string]: unknown;
}

// ─── Footer ──────────────────────────────────────────────────────────────────

export interface Footer {
  tagline: string;
  copyright: string;
  tourLinks: string[];
  infoLinks: { label: string; page: string }[];
  contacts: string[];
  [key: string]: unknown;
}

// ─── Full Content ────────────────────────────────────────────────────────────

export interface Content {
  site: Site;
  nav: Nav;
  hero: Hero;
  toursSection: ToursSection;
  tours: Tour[];
  blog: {
    posts: BlogPost[];
  };
  preCruise?: Record<string, unknown>;
  specialCards?: Record<string, unknown>[];
  b2bCards?: Record<string, unknown>[];
  about: About;
  reviews: ReviewsSection;
  contact: ContactInfo;
  footer: Footer;
  prices: Prices;
  categories: string[];
}
