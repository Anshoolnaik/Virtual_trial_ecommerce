import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Colors from '../constants/colors';
import Theme from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { addressAPI } from '../services/api';

// ─── Single Address Card ──────────────────────────────────────────────────────
const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const { label, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default } = address;

  return (
    <View style={[styles.card, is_default && styles.cardDefault]}>
      {/* Top row: label + default badge */}
      <View style={styles.cardHeader}>
        <View style={styles.labelRow}>
          {labelIcon(label)}
          <Text style={styles.labelText}>{label}</Text>
        </View>
        {is_default ? (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={onSetDefault} activeOpacity={0.7}>
            <Text style={styles.setDefaultText}>Set as default</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Address details */}
      <Text style={styles.name}>{full_name}</Text>
      <Text style={styles.line}>{address_line1}</Text>
      {address_line2 ? <Text style={styles.line}>{address_line2}</Text> : null}
      <Text style={styles.line}>{city}, {state} – {pincode}</Text>
      <Text style={styles.line}>{country}</Text>
      <View style={styles.phoneRow}>
        <Ionicons name="call-outline" size={13} color={Colors.textMuted} />
        <Text style={styles.phone}>{phone}</Text>
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit} activeOpacity={0.7}>
          <Text style={styles.actionEdit}>Edit</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete} activeOpacity={0.7}>
          <Text style={styles.actionDelete}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const labelIcon = (label = '') => {
  const l = label.toLowerCase();
  if (l.includes('home')) return <Ionicons name="home-outline" size={16} color={Colors.textSecondary} />;
  if (l.includes('work') || l.includes('office')) return <Ionicons name="briefcase-outline" size={16} color={Colors.textSecondary} />;
  return <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />;
};

// ─── AddressesScreen ──────────────────────────────────────────────────────────
const AddressesScreen = ({ onBack, onAddNew, onEdit }) => {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAddresses = useCallback(async () => {
    try {
      setError('');
      const res = await addressAPI.getAll(token);
      setAddresses(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  const handleDelete = (address) => {
    Alert.alert(
      'Delete Address',
      `Delete "${address.label}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await addressAPI.delete(token, address.id);
              setAddresses((prev) => prev.filter((a) => a.id !== address.id));
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (address) => {
    try {
      await addressAPI.setDefault(token, address.id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === address.id }))
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={onAddNew} style={styles.addBtn} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadAddresses} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="location-outline" size={52} color={Colors.textMuted} style={{ marginBottom: Theme.spacing.md }} />
          <Text style={styles.emptyTitle}>No addresses yet</Text>
          <Text style={styles.emptySubtitle}>Add a delivery address to get started.</Text>
          <TouchableOpacity style={styles.addFirstBtn} onPress={onAddNew} activeOpacity={0.8}>
            <Text style={styles.addFirstBtnText}>Add Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => onEdit(address)}
              onDelete={() => handleDelete(address)}
              onSetDefault={() => handleSetDefault(address)}
            />
          ))}
          <View style={styles.bottomPad} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: Theme.spacing.xs,
    marginRight: Theme.spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: Theme.fontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
  },
  addBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: Theme.fontSize.sm,
  },

  // List
  list: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Theme.shadow.sm,
  },
  cardDefault: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontSize: Theme.fontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  defaultBadgeText: {
    color: Colors.accent,
    fontSize: Theme.fontSize.xs,
    fontWeight: '700',
  },
  setDefaultText: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.xs,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  name: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  line: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Theme.spacing.xs,
  },
  phone: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Theme.spacing.sm,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  actionEdit: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: Theme.fontSize.sm,
  },
  actionDelete: {
    color: Colors.accent,
    fontWeight: '600',
    fontSize: Theme.fontSize.sm,
  },

  // States
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing['2xl'],
  },
  errorText: {
    color: Colors.accent,
    fontSize: Theme.fontSize.sm,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  retryBtn: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Theme.radius.full,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: Theme.fontSize.sm,
  },
  emptyTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  addFirstBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Theme.spacing['2xl'],
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.full,
  },
  addFirstBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: Theme.fontSize.md,
  },

  bottomPad: { height: Theme.spacing['3xl'] },
});

export default AddressesScreen;
