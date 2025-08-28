export function isLikelyValidUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  if (url.startsWith('data:')) return true;
  if (url.startsWith('/')) return true; // served from this site
  return false;
}

export function sanitizeImageUrl(url: string | undefined, fallback: string = '/placeholder.svg'): string {
  if (!url) return fallback;
  if (isLikelyValidUrl(url)) return url;
  // If url looks like protocol-relative (//example.com/...)
  if (url.startsWith('//')) return `https:${url}`;
  // If it's a bare filename, return fallback
  return fallback;
}

export function sanitizeImages(images: string[] | null | undefined, fallback?: string): string[] {
  const list = Array.isArray(images) ? images : [];
  const sanitized = list
    .map((u) => sanitizeImageUrl(u))
    .filter(Boolean);
  if (sanitized.length === 0 && fallback) {
    const f = sanitizeImageUrl(fallback);
    if (f) sanitized.push(f);
  }
  if (sanitized.length === 0) sanitized.push('/placeholder.svg');
  return sanitized;
}

export function getPrimaryImage(images: string[] | null | undefined, fallback?: string): string {
  const list = sanitizeImages(images, fallback);
  return list[0] || '/placeholder.svg';
}
