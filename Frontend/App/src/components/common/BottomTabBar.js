import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

const tabs = [
  { id: 'home',     label: 'Home',     icon: 'home-outline',    iconActive: 'home' },
  { id: 'explore',  label: 'Explore',  icon: 'search-outline',  iconActive: 'search' },
  { id: 'tryon',    label: 'Try-On',   icon: null,              special: true },
  { id: 'wishlist', label: 'Wishlist', icon: 'heart-outline',   iconActive: 'heart' },
  { id: 'profile',  label: 'Profile',  icon: 'person-outline',  iconActive: 'person' },
];

const BottomTabBar = ({ activeTab = 'home', onTabPress, wishlistCount = 0 }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (tab.special) {
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.specialTabWrap}
              activeOpacity={0.85}
              onPress={() => onTabPress && onTabPress(tab.id)}
            >
              <View style={styles.specialBtn}>
                <Ionicons name="shirt-outline" size={24} color={Colors.white} />
              </View>
              <Text style={styles.specialLabel}>{tab.label}</Text>
            </TouchableOpacity>
          );
        }

        const badge = tab.id === 'wishlist' && wishlistCount > 0 ? wishlistCount : null;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => onTabPress && onTabPress(tab.id)}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={22}
                color={isActive ? Colors.primary : Colors.textMuted}
              />
              {badge != null && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.white,
    paddingBottom: 20,
    paddingTop: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Theme.shadow.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
    gap: 2,
  },
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
    marginTop: 2,
  },
  specialTabWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    marginTop: -20,
  },
  specialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    ...Theme.shadow.lg,
  },
  specialLabel: {
    fontSize: Theme.fontSize.xs,
    color: Colors.accent,
    fontWeight: '700',
  },
});

export default BottomTabBar;
