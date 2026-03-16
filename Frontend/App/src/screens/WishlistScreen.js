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
import { useWishlist } from '../context/WishlistContext';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

const WishlistScreen = ({ onProductPress, onBack }) => {
  const { wishlistItems, toggleWishlist, wishlistCount } = useWishlist();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlist</Text>
        {wishlistCount > 0 && (
          <View style={styles.countPill}>
            <Text style={styles.countText}>{wishlistCount}</Text>
          </View>
        )}
      </View>

      {wishlistItems.length === 0 ? (
        <EmptyWishlist onBack={onBack} />
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {wishlistItems.map((item) => (
            <WishlistItem
              key={item.id}
              item={item}
              onPress={() => onProductPress(item)}
              onRemove={() => toggleWishlist(item)}
            />
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// ─── Wishlist Item ────────────────────────────────────────────────────────────
const WishlistItem = ({ item, onPress, onRemove }) => (
  <TouchableOpacity style={styles.itemCard} activeOpacity={0.85} onPress={onPress}>
    <Image
      source={{ uri: item.imageUrl }}
      style={styles.itemImage}
      resizeMode="cover"
    />
    <View style={styles.itemInfo}>
      <Text style={styles.itemBrand}>{item.brand}</Text>
      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
        {item.originalPrice && (
          <Text style={styles.originalPrice}>${Number(item.originalPrice).toFixed(2)}</Text>
        )}
      </View>
      {item.rating != null && (
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.rating}>{item.rating}</Text>
        </View>
      )}
    </View>
    <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.7}>
      <Ionicons name="heart" size={20} color={Colors.accent} />
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyWishlist = ({ onBack }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyIcon}>🤍</Text>
    <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
    <Text style={styles.emptySubtext}>Save items you love by tapping the heart icon.</Text>
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
  headerTitle: {
    flex: 1,
    fontSize: Theme.fontSize['2xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  countPill: {
    backgroundColor: Colors.accent,
    minWidth: 26,
    height: 26,
    borderRadius: Theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
  },

  scroll: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Theme.spacing.lg, gap: Theme.spacing.md },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.sm,
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
    alignItems: 'center',
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  originalPrice: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
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
    color: Colors.textSecondary,
  },
  removeBtn: {
    padding: Theme.spacing.sm,
  },

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
    lineHeight: 20,
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

export default WishlistScreen;
