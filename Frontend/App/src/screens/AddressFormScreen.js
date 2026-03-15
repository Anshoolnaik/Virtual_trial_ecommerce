import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Colors from '../constants/colors';
import Theme from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { addressAPI } from '../services/api';

const QUICK_LABELS = ['Home', 'Work', 'Other'];

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    {children}
  </View>
);

const Input = ({ value, onChangeText, placeholder, keyboardType, maxLength }) => (
  <TextInput
    style={styles.input}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={Colors.textMuted}
    keyboardType={keyboardType || 'default'}
    maxLength={maxLength}
    autoCorrect={false}
  />
);

// ─── AddressFormScreen ────────────────────────────────────────────────────────
const AddressFormScreen = ({ existingAddress, onBack, onSaved }) => {
  const { token } = useAuth();
  const isEdit = !!existingAddress;

  const [form, setForm] = useState({
    label: existingAddress?.label || 'Home',
    fullName: existingAddress?.full_name || '',
    phone: existingAddress?.phone || '',
    addressLine1: existingAddress?.address_line1 || '',
    addressLine2: existingAddress?.address_line2 || '',
    city: existingAddress?.city || '',
    state: existingAddress?.state || '',
    pincode: existingAddress?.pincode || '',
    country: existingAddress?.country || 'India',
    isDefault: existingAddress?.is_default || false,
  });

  const [customLabel, setCustomLabel] = useState(
    QUICK_LABELS.includes(existingAddress?.label) ? '' : (existingAddress?.label || '')
  );
  const [useCustomLabel, setUseCustomLabel] = useState(
    !!existingAddress?.label && !QUICK_LABELS.includes(existingAddress?.label)
  );

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const resolvedLabel = useCustomLabel ? customLabel : form.label;

  const handleSubmit = async () => {
    setError('');
    if (!resolvedLabel.trim()) return setError('Address name is required.');
    if (!form.fullName.trim()) return setError('Full name is required.');
    if (!form.phone.trim()) return setError('Phone number is required.');
    if (!form.addressLine1.trim()) return setError('Address line 1 is required.');
    if (!form.city.trim()) return setError('City is required.');
    if (!form.state.trim()) return setError('State is required.');
    if (!form.pincode.trim()) return setError('Pincode is required.');

    setLoading(true);
    try {
      const payload = { ...form, label: resolvedLabel };
      let result;
      if (isEdit) {
        result = await addressAPI.update(token, existingAddress.id, payload);
      } else {
        result = await addressAPI.create(token, payload);
      }
      onSaved(result.data, isEdit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Address' : 'Add New Address'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Address Name (Label) ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Name</Text>

            {/* Quick pick */}
            <View style={styles.quickLabels}>
              {QUICK_LABELS.map((ql) => (
                <TouchableOpacity
                  key={ql}
                  style={[
                    styles.quickLabel,
                    !useCustomLabel && form.label === ql && styles.quickLabelActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setUseCustomLabel(false);
                    set('label')(ql);
                  }}
                >
                  <Text style={[
                    styles.quickLabelText,
                    !useCustomLabel && form.label === ql && styles.quickLabelTextActive,
                  ]}>
                    {ql === 'Home' ? '🏠 ' : ql === 'Work' ? '💼 ' : '📍 '}{ql}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickLabel, useCustomLabel && styles.quickLabelActive]}
                activeOpacity={0.7}
                onPress={() => setUseCustomLabel(true)}
              >
                <Text style={[styles.quickLabelText, useCustomLabel && styles.quickLabelTextActive]}>
                  ✏️ Custom
                </Text>
              </TouchableOpacity>
            </View>

            {useCustomLabel && (
              <TextInput
                style={[styles.input, { marginTop: Theme.spacing.sm }]}
                value={customLabel}
                onChangeText={setCustomLabel}
                placeholder="e.g. Mom's House, Gym..."
                placeholderTextColor={Colors.textMuted}
                maxLength={50}
                autoFocus
              />
            )}
          </View>

          {/* ── Contact ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Details</Text>
            <Field label="Full Name" required>
              <Input value={form.fullName} onChangeText={set('fullName')} placeholder="Name on this address" />
            </Field>
            <Field label="Phone Number" required>
              <Input value={form.phone} onChangeText={set('phone')} placeholder="+91 00000 00000" keyboardType="phone-pad" maxLength={15} />
            </Field>
          </View>

          {/* ── Address ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Field label="Address Line 1" required>
              <Input value={form.addressLine1} onChangeText={set('addressLine1')} placeholder="House / Flat / Block No., Street" />
            </Field>
            <Field label="Address Line 2">
              <Input value={form.addressLine2} onChangeText={set('addressLine2')} placeholder="Landmark, Area (optional)" />
            </Field>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="City" required>
                  <Input value={form.city} onChangeText={set('city')} placeholder="City" />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Pincode" required>
                  <Input value={form.pincode} onChangeText={set('pincode')} placeholder="000000" keyboardType="numeric" maxLength={10} />
                </Field>
              </View>
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="State" required>
                  <Input value={form.state} onChangeText={set('state')} placeholder="State" />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Country">
                  <Input value={form.country} onChangeText={set('country')} placeholder="Country" />
                </Field>
              </View>
            </View>
          </View>

          {/* ── Default Toggle ── */}
          <TouchableOpacity
            style={styles.defaultRow}
            activeOpacity={0.7}
            onPress={() => set('isDefault')(!form.isDefault)}
          >
            <View style={[styles.checkbox, form.isDefault && styles.checkboxChecked]}>
              {form.isDefault && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View>
              <Text style={styles.defaultLabel}>Set as default address</Text>
              <Text style={styles.defaultSub}>Used automatically at checkout</Text>
            </View>
          </TouchableOpacity>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>
                {isEdit ? 'Save Changes' : 'Add Address'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomPad} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
    width: 40,
    padding: Theme.spacing.xs,
  },
  backIcon: {
    fontSize: 28,
    color: Colors.textPrimary,
    lineHeight: 30,
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    fontSize: Theme.fontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  // Scroll
  scroll: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },

  // Section
  section: {
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.sm,
    ...Theme.shadow.sm,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Theme.spacing.xs,
  },

  // Quick labels
  quickLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  quickLabel: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  quickLabelActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  quickLabelText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  quickLabelTextActive: {
    color: Colors.accent,
    fontWeight: '700',
  },

  // Field
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  required: {
    color: Colors.accent,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    fontSize: Theme.fontSize.sm,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Row layout
  row: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },

  // Default toggle
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Colors.white,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    ...Theme.shadow.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  defaultLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  defaultSub: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Error
  errorBanner: {
    backgroundColor: Colors.saleBg,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  errorText: {
    color: Colors.accent,
    fontSize: Theme.fontSize.sm,
    fontWeight: '500',
  },

  // Submit
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Theme.radius.full,
    paddingVertical: Theme.spacing.lg,
    alignItems: 'center',
    ...Theme.shadow.md,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: Colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  bottomPad: { height: Theme.spacing['3xl'] },
});

export default AddressFormScreen;
