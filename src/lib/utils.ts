export function withBase(pathname = ''): string {
  const base = import.meta.env.BASE_URL || '/';
  if (!pathname) return base;
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const trimmedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${trimmedBase}${trimmedPath}`.replace(/\/+/g, '/');
}

export function formatDate(input: Date | string): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatReportDate(value?: string): string {
  if (!value || value.length !== 8) return 'Unknown';
  return formatDate(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`);
}

export function classificationToSeverity(classification: string) {
  if (classification === 'Class I') return 'class-1' as const;
  if (classification === 'Class II') return 'class-2' as const;
  if (classification === 'Class III') return 'class-3' as const;
  return 'informational' as const;
}
