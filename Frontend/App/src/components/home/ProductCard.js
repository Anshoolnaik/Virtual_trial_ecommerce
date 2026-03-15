import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

const BADGE_CONFIG = {
  NEW: { bg: Colors.newBg, text: Colors.new },
  HOT: { bg: Colors.hotBg, text: Colors.hot },
  SALE: { bg: Colors.saleBg, text: Colors.sale },
  TRENDING: { bg: Colors.trendingBg, text: Colors.trending },
  'BEST SELLER': { bg: Colors.hotBg, text: Colors.hot },
};

const ProductCard = ({ product, style, onPress }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const badgeStyle = product.badge ? BADGE_CONFIG[product.badge] : null;

  return (
    <TouchableOpacity style={[styles.card, style]} activeOpacity={0.9} onPress={onPress}>
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Badge */}
        {badgeStyle && (
          <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
            <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
              {product.badge}
            </Text>
          </View>
        )}

        {/* Wishlist */}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => setWishlisted(!wishlisted)}
          activeOpacity={0.8}
        >
          <Text style={styles.wishlistIcon}>{wishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {/* Virtual Try-On tag */}
        {product.tryOn && (
          <View style={styles.tryOnTag}>
            <Text style={styles.tryOnText}>✨ Try On</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.reviews}>({product.reviews})</Text>
        </View>

        {/* Color swatches */}
        <View style={styles.colorsRow}>
          {product.colors.map((c, i) => (
            <View
              key={i}
              style={[
                styles.swatch,
                { backgroundColor: c },
                c === '#FFFFFF' && styles.swatchBorder,
                i === 0 && styles.swatchActive,
              ]}
            />
          ))}
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
          )}
          {product.discount && (
            <View style={styles.discountTag}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.md,
  },
  imageWrap: {
    height: 200,
    backgroundColor: Colors.inputBg,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: Theme.spacing.sm,
    left: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  wishlistBtn: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.sm,
  },
  wishlistIcon: {
    fontSize: 16,
  },
  tryOnTag: {
    position: 'absolute',
    bottom: Theme.spacing.sm,
    left: Theme.spacing.sm,
    backgroundColor: 'rgba(26,26,46,0.85)',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  tryOnText: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: '600',
  },
  info: {
    padding: Theme.spacing.md,
    gap: 5,
  },
  brand: {
    fontSize: Theme.fontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  star: {
    fontSize: 12,
    color: Colors.star,
  },
  rating: {
    fontSize: Theme.fontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reviews: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 2,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  swatchBorder: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  originalPrice: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  discountTag: {
    backgroundColor: Colors.saleBg,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Theme.radius.sm,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.sale,
  },
});

export default ProductCard;
