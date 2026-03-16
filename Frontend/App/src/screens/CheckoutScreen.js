import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { addressAPI, orderAPI } from '../services/api';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

const CheckoutScreen = ({ onBack, onOrderPlaced }) => {
  const { token } = useAuth();
  const { cartItems, clearCart } = useCart();

  const [addresses, setAddresses]           = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addrLoading, setAddrLoading]       = useState(true);
  const [placing, setPlacing]               = useState(false);

  const subtotal  = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping  = subtotal >= 100 ? 0 : 9.99;
  const total     = subtotal + shipping;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await addressAPI.getAll(token);
        const list = res.data || [];
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setSelectedAddressId(def.id);
      } catch {
        // ignore – show empty state
      } finally {
        setAddrLoading(false);
      }
    };
    if (token) load();
    else setAddrLoading(false);
  }, [token]);

  const handlePlaceOrder = async () => {
    if (!token) {
      Alert.alert('Sign in required', 'Please sign in to place an order.');
      return;
    }
    if (!selectedAddressId) {
      Alert.alert('No address', 'Please add a delivery address first.');
      return;
    }

    setPlacing(true);
    try {
      await orderAPI.create(token, {
        addressId: selectedAddressId,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity:  item.quantity,
          size:      item.size  || null,
          color:     item.color || null,
        })),
      });
      clearCart();
      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully. Payment will be collected on delivery.',
        [{ text: 'View Orders', onPress: onOrderPlaced }]
      );
    } catch (err) {
      Alert.alert('Failed', err.message || 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── Delivery Address ── */}
        <SectionLabel label="Delivery Address" icon="location-outline" />

        {addrLoading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginVertical: 16 }} />
        ) : addresses.length === 0 ? (
          <View style={styles.emptyAddr}>
            <Ionicons name="location-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyAddrText}>No saved addresses.</Text>
            <Text style={styles.emptyAddrSub}>Go to Profile → Addresses to add one.</Text>
          </View>
        ) : (
          addresses.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              style={[styles.addrCard, selectedAddressId === addr.id && styles.addrCardSelected]}
              activeOpacity={0.75}
              onPress={() => setSelectedAddressId(addr.id)}
            >
              <View style={styles.radioOuter}>
                {selectedAddressId === addr.id && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.addrRow}>
                  <Text style={styles.addrLabel}>{addr.label}</Text>
                  {addr.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addrName}>{addr.full_name}</Text>
                <Text style={styles.addrLine}>{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</Text>
                <Text style={styles.addrLine}>{addr.city}, {addr.state} – {addr.pincode}</Text>
                <Text style={styles.addrPhone}>{addr.phone}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* ── Payment Method ── */}
        <SectionLabel label="Payment Method" icon="card-outline" />

        <View style={[styles.addrCard, styles.addrCardSelected]}>
          <View style={styles.radioOuter}>
            <View style={styles.radioInner} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.codRow}>
              <Ionicons name="cash-outline" size={20} color={Colors.success} />
              <Text style={styles.codLabel}>Cash on Delivery</Text>
            </View>
            <Text style={styles.codSub}>Pay when your order arrives</Text>
          </View>
        </View>

        {/* ── Order Summary ── */}
        <SectionLabel label="Order Summary" icon="receipt-outline" />

        <View style={styles.summaryCard}>
          {cartItems.map((item) => (
            <View key={item.cartKey} style={styles.summaryItem}>
              <Text style={styles.summaryItemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.summaryItemMeta}>{item.size} · {item.color ? 'Color' : ''} × {item.quantity}</Text>
              <Text style={styles.summaryItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
          <SummaryRow
            label="Shipping"
            value={shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            valueStyle={shipping === 0 ? styles.freeText : null}
          />
          <View style={styles.divider} />
          <SummaryRow label="Total" value={`$${total.toFixed(2)}`} bold />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity
          style={[styles.placeBtn, (placing || addresses.length === 0) && styles.placeBtnDisabled]}
          onPress={handlePlaceOrder}
          activeOpacity={0.85}
          disabled={placing || addresses.length === 0}
        >
          {placing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.placeText}>
              Place Order · ${total.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionLabel = ({ label, icon }) => (
  <View style={styles.sectionLabel}>
    <Ionicons name={icon} size={16} color={Colors.textSecondary} />
    <Text style={styles.sectionLabelText}>{label}</Text>
  </View>
);

const SummaryRow = ({ label, value, valueStyle, bold }) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, bold && styles.summaryLabelBold]}>{label}</Text>
    <Text style={[styles.summaryValue, bold && styles.summaryValueBold, valueStyle]}>{value}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
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
    fontSize: Theme.fontSize['2xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  scroll: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Theme.spacing.lg, gap: Theme.spacing.md },

  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
    marginBottom: 4,
  },
  sectionLabelText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Address card
  addrCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Theme.spacing.md,
    alignItems: 'flex-start',
    ...Theme.shadow.sm,
  },
  addrCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: '#FFF8F9',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: 2,
  },
  addrLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  defaultBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.radius.sm,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addrName: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addrLine: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  addrPhone: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },

  emptyAddr: {
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    gap: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyAddrText: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyAddrSub: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // COD
  codRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: 2,
  },
  codLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  codSub: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },

  // Summary
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.sm,
    ...Theme.shadow.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  summaryItemName: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  summaryItemMeta: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
  },
  summaryItemPrice: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 56,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
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
  summaryLabelBold: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryValue: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  summaryValueBold: {
    fontSize: Theme.fontSize.xl,
    fontWeight: '900',
  },
  freeText: {
    color: Colors.success,
    fontWeight: '700',
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
  placeBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.md,
  },
  placeBtnDisabled: {
    opacity: 0.5,
  },
  placeText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: Theme.fontSize.md,
    letterSpacing: 0.3,
  },
});

export default CheckoutScreen;
