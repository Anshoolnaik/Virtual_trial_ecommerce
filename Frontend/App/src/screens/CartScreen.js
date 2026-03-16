import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

const CartScreen = ({ onBack }) => {
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 9.99) : 0;
  const total = subtotal + shipping;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={styles.cartCountPill}>
          <Text style={styles.cartCountText}>{cartCount}</Text>
        </View>
      </View>

      {cartItems.length === 0 ? (
        <EmptyCart onBack={onBack} />
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Items */}
            {cartItems.map((item) => (
              <CartItem key={item.cartKey} item={item} onRemove={removeFromCart} onUpdateQty={updateQuantity} />
            ))}

            {/* Free shipping banner */}
            {subtotal < 100 && (
              <View style={styles.shippingBanner}>
                <Ionicons name="car-outline" size={16} color={Colors.success} />
                <Text style={styles.shippingBannerText}>
                  Add <Text style={styles.shippingBannerBold}>${(100 - subtotal).toFixed(2)}</Text> more for free shipping!
                </Text>
              </View>
            )}
            {subtotal >= 100 && (
              <View style={[styles.shippingBanner, styles.shippingBannerFree]}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.shippingBannerText}>You qualify for <Text style={styles.shippingBannerBold}>free shipping</Text>!</Text>
              </View>
            )}

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={[styles.summaryValue, shipping === 0 && styles.freeText]}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Checkout CTA */}
          <View style={styles.ctaBar}>
            <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85}>
              <Text style={styles.checkoutText}>Proceed to Checkout  →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

// ─── Cart Item ────────────────────────────────────────────────────────────────
const CartItem = ({ item, onRemove, onUpdateQty }) => (
  <View style={styles.itemCard}>
    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
    <View style={styles.itemInfo}>
      <Text style={styles.itemBrand}>{item.brand}</Text>
      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.itemMeta}>
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
        <Text style={styles.itemSize}>{item.size}</Text>
      </View>
      <View style={styles.itemBottom}>
        <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => item.quantity === 1 ? onRemove(item.cartKey) : onUpdateQty(item.cartKey, item.quantity - 1)}
            activeOpacity={0.7}
          >
            <Ionicons name={item.quantity === 1 ? 'trash-outline' : 'remove'} size={14} color={item.quantity === 1 ? Colors.accent : Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => onUpdateQty(item.cartKey, item.quantity + 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={14} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyCart = ({ onBack }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyIcon}>🛍️</Text>
    <Text style={styles.emptyTitle}>Your cart is empty</Text>
    <Text style={styles.emptySubtext}>Looks like you haven't added anything yet.</Text>
    <TouchableOpacity style={styles.shopBtn} onPress={onBack} activeOpacity={0.85}>
      <Text style={styles.shopBtnText}>Start Shopping</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
    gap: Theme.spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Theme.radius.md,
    backgroundColor: Colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Theme.fontSize['2xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  cartCountPill: {
    backgroundColor: Colors.accent,
    minWidth: 26,
    height: 26,
    borderRadius: Theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cartCountText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
  },

  // Scroll
  scroll: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Theme.spacing.lg, gap: Theme.spacing.md },

  // Item Card
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.sm,
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  itemImage: {
    width: 90,
    height: 110,
    borderRadius: Theme.radius.md,
    backgroundColor: Colors.inputBg,
  },
  itemInfo: {
    flex: 1,
    gap: 5,
    justifyContent: 'space-between',
  },
  itemBrand: {
    fontSize: Theme.fontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemSize: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    backgroundColor: Colors.background,
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 3,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.sm,
  },
  qtyText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 18,
    textAlign: 'center',
  },

  // Shipping banner
  shippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: '#F0FDF4',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  shippingBannerFree: {
    backgroundColor: '#F0FDF4',
  },
  shippingBannerText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  shippingBannerBold: {
    fontWeight: '700',
    color: Colors.success,
  },

  // Order summary
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
    ...Theme.shadow.sm,
  },
  summaryTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  freeText: {
    color: Colors.success,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  totalLabel: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Theme.fontSize.xl,
    fontWeight: '900',
    color: Colors.textPrimary,
  },

  // CTA
  ctaBar: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Theme.spacing.xl : Theme.spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Theme.shadow.lg,
  },
  checkoutBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.md,
  },
  checkoutText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: Theme.fontSize.md,
    letterSpacing: 0.3,
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing['3xl'],
  },
  emptyIcon: { fontSize: 64 },
  emptyTitle: {
    fontSize: Theme.fontSize['2xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  shopBtn: {
    marginTop: Theme.spacing.md,
    backgroundColor: Colors.accent,
    paddingHorizontal: Theme.spacing['3xl'],
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.full,
    ...Theme.shadow.md,
  },
  shopBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: Theme.fontSize.md,
  },
});

export default CartScreen;
