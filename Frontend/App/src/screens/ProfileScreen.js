import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Theme from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// ─── Menu Item ───────────────────────────────────────────────────────────────
const MenuItem = ({ icon, label, sublabel, onPress, danger, rightBadge }) => (
  <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
    <View style={[styles.menuIconWrap, danger && styles.menuIconWrapDanger]}>
      {icon}
    </View>
    <View style={styles.menuText}>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {sublabel ? <Text style={styles.menuSublabel}>{sublabel}</Text> : null}
    </View>
    {rightBadge != null && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{rightBadge}</Text>
      </View>
    )}
    {!rightBadge && !danger && (
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    )}
  </TouchableOpacity>
);

// ─── Section ─────────────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <View style={styles.section}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

// ─── Profile Screen ───────────────────────────────────────────────────────────
const ProfileScreen = ({ onNavigate, onOpenAddresses }) => {
  const { user, signOut } = useAuth();

  const name = user?.full_name || 'Guest User';
  const email = user?.email || 'Sign in to access your account';
  const initial = name[0]?.toUpperCase() || '?';

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut();
            onNavigate && onNavigate('login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      bounces
    >
      {/* ── Profile Header ── */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.profileName}>{name}</Text>
        <Text style={styles.profileEmail}>{email}</Text>
        {user && (
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
        {!user && (
          <TouchableOpacity
            style={styles.signInBtn}
            activeOpacity={0.8}
            onPress={() => onNavigate && onNavigate('login')}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Orders & Shopping ── */}
      <Section title="Orders & Shopping">
        <MenuItem
          icon={<Ionicons name="cube-outline" size={20} color={Colors.textSecondary} />}
          label="My Orders"
          sublabel="Track, return or buy again"
          onPress={() => {}}
          rightBadge={2}
        />
        <View style={styles.divider} />
        <MenuItem
          icon={<Ionicons name="heart-outline" size={20} color={Colors.textSecondary} />}
          label="Wishlist"
          sublabel="Items you've saved"
          onPress={() => {}}
        />
        <View style={styles.divider} />
        <MenuItem
          icon={<Ionicons name="refresh-outline" size={20} color={Colors.textSecondary} />}
          label="Returns & Refunds"
          sublabel="Manage your returns"
          onPress={() => {}}
        />
      </Section>

      {/* ── Account ── */}
      <Section title="Account">
        <MenuItem
          icon={<Ionicons name="location-outline" size={20} color={Colors.textSecondary} />}
          label="Addresses"
          sublabel="Manage delivery addresses"
          onPress={onOpenAddresses}
        />
        <View style={styles.divider} />
        <MenuItem
          icon={<Ionicons name="card-outline" size={20} color={Colors.textSecondary} />}
          label="Payment Methods"
          sublabel="Cards & UPI"
          onPress={() => {}}
        />
        <View style={styles.divider} />
        <MenuItem
          icon={<Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />}
          label="Notifications"
          sublabel="Deals, order updates & more"
          onPress={() => {}}
        />
      </Section>

      {/* ── Preferences ── */}
      <Section title="Preferences">
        <MenuItem
          icon={<Ionicons name="shirt-outline" size={20} color={Colors.textSecondary} />}
          label="Virtual Try-On History"
          sublabel="Outfits you've tried on"
          onPress={() => {}}
        />
        <View style={styles.divider} />
        <MenuItem
          icon={<Ionicons name="color-palette-outline" size={20} color={Colors.textSecondary} />}
          label="My Style Profile"
          sublabel="Size & style preferences"
          onPress={() => {}}
        />
      </Section>

      {/* ── Support ── */}
      <Section title="Support">
        <MenuItem
          icon={<Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />}
          label="Help & Support"
          onPress={() => {}}
        />
        <View style={styles.divider} />
        <MenuItem
          icon={<Ionicons name="star-outline" size={20} color={Colors.textSecondary} />}
          label="Rate the App"
          onPress={() => {}}
        />
        <View style={styles.divider} />
        <MenuItem
          icon={<Ionicons name="document-text-outline" size={20} color={Colors.textSecondary} />}
          label="Privacy Policy"
          onPress={() => {}}
        />
      </Section>

      {/* ── Sign Out ── */}
      {user && (
        <Section>
          <MenuItem
            icon={<Ionicons name="log-out-outline" size={20} color={Colors.accent} />}
            label="Sign Out"
            onPress={handleSignOut}
            danger
          />
        </Section>
      )}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Profile Header
  profileHeader: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: Theme.spacing['2xl'],
    paddingBottom: Theme.spacing['2xl'],
    paddingHorizontal: Theme.spacing.lg,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
  },
  profileName: {
    fontSize: Theme.fontSize['2xl'],
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  editBtn: {
    marginTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  editBtnText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
  },
  signInBtn: {
    marginTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing['2xl'],
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    backgroundColor: Colors.accent,
  },
  signInBtnText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
  },

  // Section
  section: {
    marginTop: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Theme.spacing.sm,
    marginLeft: Theme.spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.sm,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Theme.radius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconWrapDanger: {
    backgroundColor: Colors.saleBg,
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  menuLabelDanger: {
    color: Colors.accent,
  },
  menuSublabel: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  // Badge
  badge: {
    backgroundColor: Colors.accent,
    borderRadius: Theme.radius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: Colors.white,
    fontSize: Theme.fontSize.xs,
    fontWeight: '700',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 56 + Theme.spacing.md,
  },

  bottomPad: {
    height: Theme.spacing['3xl'],
  },
});

export default ProfileScreen;
