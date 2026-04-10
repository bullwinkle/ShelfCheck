export const SITE = {
  name: 'Shelf Check',
  siteUrl: 'https://bullwinkle.js.org',
  basePath: '/ShelfCheck',
  description:
    'Food recall intelligence with accountability scores, daily digest coverage, and Inspector Morsel commentary.',
  mascot: 'Inspector Morsel 🦝',
  donateUrl: 'https://github.com/sponsors/bullwinkle',
};

export const NAV_ITEMS = [
  { href: '', label: 'Home' },
  { href: 'daily-digest', label: 'Daily Digest' },
  { href: 'deep-dives', label: 'Deep Dives' },
  { href: 'brands', label: 'Brand Reports' },
  { href: 'about', label: 'About' },
  { href: 'support', label: 'Support' },
  { href: 'keystatic', label: 'Admin' },
] as const;
