import { fetchApi } from './api';

export const getLocalWishlist = (): number[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('vanity_wishlist');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const setLocalWishlist = (ids: number[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('vanity_wishlist', JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('vanity_wishlist_updated', { detail: { ids } }));
  } catch (e) {
    console.error('Error saving wishlist:', e);
  }
};

export const toggleWishlistItem = async (productId: number, token?: string | null): Promise<boolean> => {
  const numericId = Number(productId);
  let isAdded = false;

  // 1. Update guest localStorage immediately for instant feedback
  const current = getLocalWishlist();
  if (current.includes(numericId)) {
    const updated = current.filter(id => id !== numericId);
    setLocalWishlist(updated);
    isAdded = false;
  } else {
    const updated = [...current, numericId];
    setLocalWishlist(updated);
    isAdded = true;
  }

  // 2. If user is logged in, sync with backend database
  if (token) {
    try {
      const res = await fetchApi('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ product_id: numericId }),
      });
      if (res.success && res.status) {
        isAdded = res.status === 'added';
      }
    } catch (err) {
      console.error('Error syncing wishlist with backend:', err);
    }
  }

  return isAdded;
};
