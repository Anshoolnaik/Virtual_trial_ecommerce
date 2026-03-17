import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../context/NotificationContext';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

const TYPE_ICON = {
  order_placed: { name: 'bag-check-outline',  color: Colors.success },
  order_status: { name: 'cube-outline',        color: Colors.accent  },
};

const formatTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'Just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationItem = ({ item, onPress }) => {
  const icon = TYPE_ICON[item.type] || { name: 'notifications-outline', color: Colors.accent };

  return (
    <TouchableOpacity
      style={[styles.item, !item.is_read && styles.itemUnread]}
      activeOpacity={0.75}
      onPress={() => onPress(item.id)}
    >
      <View style={[styles.iconWrap, { backgroundColor: icon.color + '1A' }]}>
        <Ionicons name={icon.name} size={20} color={icon.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title}</Text>
          {!item.is_read && <View style={styles.dot} />}
        </View>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>{formatTime(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const NotificationScreen = ({ onBack }) => {
  const { notifications, markRead, markAllRead } = useNotifications();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.heading}>Notifications</Text>
        {notifications.some((n) => !n.is_read) ? (
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={52} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyBody}>You'll be notified about order updates here.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem item={item} onPress={markRead} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Theme.radius.md,
    backgroundColor: Colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  markAll: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.accent,
    width: 80,
    textAlign: 'right',
  },
  list: {
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemUnread: {
    borderColor: Colors.accent + '40',
    backgroundColor: Colors.accentLight,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  title: {
    fontSize: Theme.fontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  body: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  time: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Theme.spacing.md,
  },
  emptyBody: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default NotificationScreen;
