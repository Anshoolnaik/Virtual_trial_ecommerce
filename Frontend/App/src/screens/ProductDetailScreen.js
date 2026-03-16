import { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BADGE_CONFIG = {
  NEW: { bg: Colors.newBg, text: Colors.new },
  HOT: { bg: Colors.hotBg, text: Colors.hot },
  SALE: { bg: Colors.saleBg, text: Colors.sale },
  TRENDING: { bg: Colors.trendingBg, text: Colors.trending },
  'BEST SELLER': { bg: Colors.hotBg, text: Colors.hot },
};

const getSizes = (name = '') => {
  if (/boot|shoe|force|sneaker|footwear/i.test(name)) return ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
  if (/bag|crossbody|necklace|chain|sunglass/i.test(name)) return ['One Size'];
  return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
};

const getDescription = (name = '', brand = '') =>
  `The ${name} by ${brand} combines modern design with premium craftsmanship. ` +
  `Crafted for everyday versatility, it delivers a perfect balance of comfort and style. ` +
  `Whether dressed up or down, this piece is a wardrobe essential that speaks for itself.`;

// ─── Product Detail Screen ────────────────────────────────────────────────────
const ProductDetailScreen = ({ product, onBack, onNavigate }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const flatRef = useRef(null);
  const { addToCart } = useCart();
  const { token } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  // Build image list filtered by selected color.
  // If no images are tagged for that color, show all images (graceful fallback).
  const allImages = product.images?.length
    ? product.images
    : product.imageUrl
    ? [{ url: product.imageUrl, color: null }]
    : [];

  const colorImages = selectedColor
    ? allImages.filter((img) => img.color === selectedColor)
    : [];

  const images = colorImages.length > 0
    ? colorImages.map((img) => img.url)
    : allImages.map((img) => img.url);

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert('Select a size', 'Please choose a size before adding to cart.');
      return;
    }
    addToCart(product, selectedSize, selectedColor);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const sizes = getSizes(product.name);
  const badgeStyle = product.badge ? BADGE_CONFIG[product.badge] : null;
  const discountPct = product.discount
    ? product.discount
    : product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Scrollable body ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Hero Image Carousel ── */}
        <View style={styles.imageWrap}>
          <FlatList
            ref={flatRef}
            data={images}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImgIdx(idx);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          />

          {/* Dot indicators — only when > 1 image */}
          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeImgIdx && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Gradient overlay */}
          <View style={styles.imageOverlay} />

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Wishlist */}
          <TouchableOpacity
            style={styles.wishBtn}
            onPress={() => {
              if (!token) { onNavigate?.('login'); return; }
              toggleWishlist(product);
            }}
            activeOpacity={0.85}
          >
            <Ionicons
              name={wishlisted ? 'heart' : 'heart-outline'}
              size={18}
              color={wishlisted ? Colors.accent : Colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Badge */}
          {badgeStyle && (
            <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
              <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
                {product.badge}
              </Text>
            </View>
          )}

          {/* Try-On tag */}
          {product.tryOn && (
            <View style={styles.tryOnTag}>
              <Text style={styles.tryOnTagText}>Virtual Try-On</Text>
            </View>
          )}
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>

          {/* Brand + Name + Rating */}
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingPill}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingVal}>{product.rating}</Text>
              <Text style={styles.ratingCount}>({product.reviews} reviews)</Text>
            </View>
            {product.badge && (
              <View style={[styles.badgePill, { backgroundColor: badgeStyle?.bg }]}>
                <Text style={[styles.badgePillText, { color: badgeStyle?.text }]}>
                  {product.badge}
                </Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
            )}
            {discountPct && (
              <View style={styles.discountTag}>
                <Text style={styles.discountText}>{discountPct}% OFF</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Color selector */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Color</Text>
              <View style={[styles.selectedColorDot, { backgroundColor: selectedColor }]} />
            </View>
            <View style={styles.swatchRow}>
              {product.colors.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    c === '#FFFFFF' && styles.swatchWhite,
                    selectedColor === c && styles.swatchSelected,
                  ]}
                  onPress={() => {
                    setSelectedColor(c);
                    setActiveImgIdx(0);
                    flatRef.current?.scrollToOffset({ offset: 0, animated: true });
                  }}
                  activeOpacity={0.8}
                />
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Size selector */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Size</Text>
              {selectedSize && (
                <Text style={styles.selectedSizeLabel}>{selectedSize}</Text>
              )}
            </View>
            <View style={styles.sizeRow}>
              {sizes.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sizeBtn, selectedSize === s && styles.sizeBtnActive]}
                  onPress={() => setSelectedSize(s)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sizeBtnText, selectedSize === s && styles.sizeBtnTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.descText}>
              {product.description || getDescription(product.name, product.brand)}
            </Text>
          </View>

          {/* Details */}
          {[
            ['Material', product.material],
            ['Fit',      product.fit],
            ['Care',     product.care],
            ['Origin',   product.origin],
          ].some(([, v]) => v) && (
            <View style={styles.detailsCard}>
              {[
                ['Material', product.material],
                ['Fit',      product.fit],
                ['Care',     product.care],
                ['Origin',   product.origin],
              ].filter(([, v]) => v).map(([key, val]) => (
                <View key={key} style={styles.detailRow}>
                  <Text style={styles.detailKey}>{key}</Text>
                  <Text style={styles.detailVal}>{val}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom padding for fixed CTA */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ── Fixed CTA bar ── */}
      <View style={styles.ctaBar}>
        {product.tryOn && (
          <TouchableOpacity style={styles.tryOnBtn} activeOpacity={0.85}>
            <Text style={styles.tryOnBtnText}>Try On</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.addToCartBtn, product.tryOn ? { flex: 2 } : { flex: 1 }, addedToCart && styles.addToCartBtnAdded]}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <Text style={styles.addToCartText}>{addedToCart ? '✓ Added!' : 'Add to Cart'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scroll: {
    flex: 1,
  },

  // Hero
  imageWrap: {
    height: 400,
    backgroundColor: Colors.inputBg,
  },
  image: {
    width: SCREEN_WIDTH,
    height: 400,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    backgroundColor: Colors.white,
    width: 18,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    background: 'transparent',
    // Subtle top gradient via a semi-transparent layer only at top
    height: 90,
    backgroundGradient: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 12 : 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.md,
  },
  wishBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 12 : 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.md,
  },
  badge: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 62 : 66,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tryOnTag: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(26,26,46,0.88)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.radius.full,
  },
  tryOnTagText: {
    color: Colors.white,
    fontSize: Theme.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Content
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  brand: {
    fontSize: Theme.fontSize.xs,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  name: {
    fontSize: Theme.fontSize['3xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  star: {
    fontSize: 13,
    color: Colors.star,
  },
  ratingVal: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ratingCount: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  price: {
    fontSize: Theme.fontSize['2xl'],
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  originalPrice: {
    fontSize: Theme.fontSize.md,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  discountTag: {
    backgroundColor: Colors.saleBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.sm,
  },
  discountText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: '800',
    color: Colors.sale,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Theme.spacing.lg,
  },

  // Sections
  section: {
    gap: Theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  selectedColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  selectedSizeLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
    color: Colors.accent,
  },

  // Color swatches
  swatchRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    flexWrap: 'wrap',
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchWhite: {
    borderColor: Colors.border,
  },
  swatchSelected: {
    borderColor: Colors.primary,
    transform: [{ scale: 1.15 }],
  },

  // Size buttons
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  sizeBtn: {
    minWidth: 52,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  sizeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  sizeBtnText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sizeBtnTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },

  // Description
  descText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Details card
  detailsCard: {
    marginTop: Theme.spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailKey: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  detailVal: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: Theme.spacing.md,
  },

  // CTA bar
  ctaBar: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Theme.spacing.xl : Theme.spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Theme.shadow.lg,
  },
  tryOnBtn: {
    flex: 1,
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.radius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tryOnBtnText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: Theme.fontSize.sm,
  },
  addToCartBtn: {
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.md,
  },
  addToCartBtnAdded: {
    backgroundColor: Colors.success,
  },
  addToCartText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: Theme.fontSize.md,
    letterSpacing: 0.3,
  },
});

export default ProductDetailScreen;
