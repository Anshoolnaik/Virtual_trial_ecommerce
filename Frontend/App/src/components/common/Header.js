import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

const Header = ({ onNavigate, onCartPress, onNotificationsPress }) => {
  const { isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoRow}>
        <View style={styles.logoIconWrap}>
          <Text style={styles.logoIconText}>V</Text>
        </View>
        <View>
          <Text style={styles.logoMain}>VOGUE</Text>
          <Text style={styles.logoSub}>VIRTUAL TRY-ON</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {isAuthenticated ? (
          <>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={onNotificationsPress}>
              <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={onCartPress}>
              <Ionicons name="bag-outline" size={20} color={Colors.textPrimary} />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.avatar} activeOpacity={0.8}>
              <Text style={styles.avatarText}>
                {user?.full_name?.[0]?.toUpperCase() ?? 'A'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="bag-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => onNavigate?.('login')}
              activeOpacity={0.85}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  logoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Theme.radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    color: Colors.accent,
    fontSize: Theme.fontSize.xl,
    fontWeight: '800',
  },
  logoMain: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 2,
    lineHeight: 18,
  },
  logoSub: {
    fontSize: Theme.fontSize.xs,
    fontWeight: '500',
    color: Colors.accent,
    letterSpacing: 1.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Theme.radius.md,
    backgroundColor: Colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '700',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  avatarText: {
    color: Colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: '700',
  },
  signInBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
  },
  signInText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default Header;
