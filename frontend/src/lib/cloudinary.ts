/**
 * Cloudinary CDN URL Transformer
 * Automatically optimizes images using Cloudinary CDN transformations (f_auto, q_auto, width).
 */
export function getOptimizedImageUrl(url: string | null | undefined, width = 800): string {
  if (!url) return '/logo.png';

  // If already a Cloudinary URL, inject auto format, quality, and width parameters
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/')) {
      return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
    }
    return url;
  }

  // If Unsplash URL, append auto format, quality and width parameters
  if (url.includes('images.unsplash.com')) {
    const hasParams = url.includes('?');
    return `${url}${hasParams ? '&' : '?'}auto=format&fit=crop&w=${width}&q=80`;
  }

  // Return original URL for local or other storage
  return url;
}
