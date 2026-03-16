import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#F59E0B', bg: '#FFFBEB' },
  confirmed: { label: 'Confirmed', color: '#3B82F6', bg: '#EFF6FF' },
  shipped:   { label: 'Shipped',   color: '#8B5CF6', bg: '#F5F3FF' },
  delivered: { label: 'Delivered', color: '#10B981', bg: '#ECFDF5' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEF2F2' },
};

const OrdersScreen = ({ onBack }) => {
  const { token } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const res = await orderAPI.getAll(token);
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : !token ? (
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Sign in to see your orders</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.accent} />
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load} activeOpacity={0.8}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySub}>Your placed orders will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order }) => {
  const status  = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const items   = order.items || [];
  const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);
  const date    = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.orderId}>#{shortId}</Text>
          <Text style={styles.orderDate}>{date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Items preview */}
      {items.slice(0, 2).map((item, idx) => (
        <View key={idx} style={styles.itemRow}>
          <Ionicons name="shirt-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.itemName} numberOfLines={1}>
            {item.product_name}
          </Text>
          {item.size ? <Text style={styles.itemMeta}>{item.size}</Text> : null}
          <Text style={styles.itemQty}>× {item.quantity}</Text>
        </View>
      ))}
      {items.length > 2 && (
        <Text style={styles.moreItems}>+{items.length - 2} more item{items.length - 2 !== 1 ? 's' : ''}</Text>
      )}

      {/* Bottom row */}
      <View style={styles.cardBottom}>
        <View style={styles.payBadge}>
          <Ionicons name="cash-outline" size={12} color={Colors.success} />
          <Text style={styles.payText}>Cash on Delivery</Text>
        </View>
        <Text style={styles.totalText}>${parseFloat(order.total_amount).toFixed(2)}</Text>
      </View>

      {/* Address line */}
      {order.address_snapshot && (
        <Text style={styles.addrSnap} numberOfLines={1}>
          <Ionicons name="location-outline" size={11} />
          {' '}{order.address_snapshot.city}, {order.address_snapshot.state}
        </Text>
      )}
    </View>
  );
};

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

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing['3xl'],
  },
  emptyIcon: { fontSize: 56 },
  emptyTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: Theme.spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Theme.spacing['2xl'],
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: Theme.fontSize.sm,
  },

  list: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
    backgroundColor: Colors.background,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
    ...Theme.shadow.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: Theme.fontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  orderDate: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  statusText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: '700',
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  itemName: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  itemMeta: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemQty: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  moreItems: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
    marginLeft: 18,
  },

  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Theme.spacing.sm,
    marginTop: 2,
  },
  payBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  payText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.success,
    fontWeight: '600',
  },
  totalText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  addrSnap: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
  },
});

export default OrdersScreen;
