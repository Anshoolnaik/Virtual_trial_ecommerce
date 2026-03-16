import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistAPI } from '../services/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { token } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState([]);

  const loadWishlist = useCallback(async () => {
    if (!token) {
      setWishlistIds(new Set());
      setWishlistItems([]);
      return;
    }
    try {
      const [idsRes, itemsRes] = await Promise.all([
        wishlistAPI.getIds(token),
        wishlistAPI.getAll(token),
      ]);
      setWishlistIds(new Set(idsRes.data));
      setWishlistItems(itemsRes.data);
    } catch {
      // silently fail — user may not be logged in
    }
  }, [token]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const isWishlisted = (productId) => wishlistIds.has(productId);

  const toggleWishlist = async (product) => {
    if (!token) return;
    const id = product.id;
    const alreadyWishlisted = wishlistIds.has(id);

    // Optimistic update
    if (alreadyWishlisted) {
      setWishlistIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setWishlistIds((prev) => new Set([...prev, id]));
      setWishlistItems((prev) => [product, ...prev]);
    }

    try {
      if (alreadyWishlisted) {
        await wishlistAPI.remove(token, id);
      } else {
        await wishlistAPI.add(token, id);
      }
    } catch {
      // Revert on error
      loadWishlist();
    }
  };

  const wishlistCount = wishlistIds.size;

  return (
    <WishlistContext.Provider value={{ wishlistItems, isWishlisted, toggleWishlist, wishlistCount, loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
