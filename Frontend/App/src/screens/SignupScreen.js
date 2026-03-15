import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Password Strength ────────────────────────────────────────────────────────
const getStrength = (pwd) => {
  if (!pwd) return { level: 0, label: '', color: Colors.border };
  if (pwd.length < 6) return { level: 1, label: 'Weak', color: '#EF4444' };
  if (pwd.length < 8 || !/[A-Z]/.test(pwd)) return { level: 2, label: 'Fair', color: '#F59E0B' };
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { level: 4, label: 'Strong', color: Colors.success };
  return { level: 3, label: 'Good', color: Colors.new };
};

const StrengthBar = ({ password }) => {
  const { level, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <View style={strengthStyles.container}>
      <View style={strengthStyles.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[strengthStyles.bar, { backgroundColor: i <= level ? color : Colors.border }]}
          />
        ))}
      </View>
      <Text style={[strengthStyles.label, { color }]}>{label}</Text>
    </View>
  );
};

const strengthStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  bars: { flex: 1, flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 3, borderRadius: 2 },
  label: { fontSize: Theme.fontSize.xs, fontWeight: '700', width: 44, textAlign: 'right' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const SignupScreen = ({ onNavigate }) => {
  const { signIn } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    if (!form.fullName.trim()) return 'Please enter your full name.';
    if (!form.email.trim()) return 'Please enter your email.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    if (!agreed) return 'Please agree to the Terms & Privacy Policy.';
    return null;
  };

  const handleSignup = async () => {
    setError('');
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    try {
      const res = await authAPI.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      signIn(res.data.user, res.data.token);
      onNavigate('home');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (key, ref, nextRef, opts = {}) => ({
    ref,
    style: styles.input,
    placeholderTextColor: Colors.textMuted,
    value: form[key],
    onChangeText: set(key),
    returnKeyType: nextRef ? 'next' : 'done',
    onFocus: () => setFocusedField(key),
    onBlur: () => setFocusedField(null),
    onSubmitEditing: () => (nextRef ? nextRef.current?.focus() : handleSignup()),
    ...opts,
  });

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Hero ──────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={[styles.circle, styles.c1]} />
          <View style={[styles.circle, styles.c2]} />
          <View style={[styles.circle, styles.c3]} />

          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>V</Text>
            </View>
            <Text style={styles.brandName}>VOGUE</Text>
          </View>

          <Text style={styles.heroTitle}>Create{'\n'}Account ✨</Text>
          <Text style={styles.heroSubtitle}>Join thousands of fashion lovers today</Text>
        </View>

        {/* ── Form Card ─────────────────────────────────── */}
        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[styles.inputWrap, focusedField === 'fullName' && styles.inputFocused]}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                {...inputProps('fullName', null, emailRef, {
                  placeholder: 'Alex Johnson',
                  autoCapitalize: 'words',
                  autoCorrect: false,
                })}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrap, focusedField === 'email' && styles.inputFocused]}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                {...inputProps('email', emailRef, passwordRef, {
                  placeholder: 'you@example.com',
                  keyboardType: 'email-address',
                  autoCapitalize: 'none',
                  autoCorrect: false,
                })}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrap, focusedField === 'password' && styles.inputFocused]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                {...inputProps('password', passwordRef, confirmRef, {
                  placeholder: 'Min. 6 characters',
                  secureTextEntry: !showPassword,
                })}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            <StrengthBar password={form.password} />
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.inputWrap, focusedField === 'confirm' && styles.inputFocused,
              form.confirm && form.password !== form.confirm && styles.inputError]}>
              <Text style={styles.inputIcon}>🔏</Text>
              <TextInput
                {...inputProps('confirm', confirmRef, null, {
                  placeholder: 'Re-enter your password',
                  secureTextEntry: !showConfirm,
                })}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            {form.confirm && form.password !== form.confirm && (
              <Text style={styles.matchError}>Passwords don't match</Text>
            )}
          </View>

          {/* Terms */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleSignup}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account  →</Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => onNavigate('login')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const HERO_HEIGHT = SCREEN_HEIGHT * 0.35;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.primary },
  scrollContent: { flexGrow: 1 },

  hero: {
    height: HERO_HEIGHT,
    backgroundColor: Colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 52,
    justifyContent: 'flex-end',
    paddingBottom: Theme.spacing['2xl'],
    overflow: 'hidden',
  },
  circle: { position: 'absolute', borderRadius: 999 },
  c1: { width: 200, height: 200, top: -50, right: -40, backgroundColor: 'rgba(255,255,255,0.04)' },
  c2: { width: 140, height: 140, bottom: 0, left: -40, backgroundColor: 'rgba(255,56,92,0.08)' },
  c3: { width: 260, height: 260, top: 20, left: -60, backgroundColor: 'rgba(255,255,255,0.025)' },

  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Theme.spacing.lg },
  logoBox: {
    width: 32, height: 32, borderRadius: 7,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  brandName: { fontSize: Theme.fontSize.lg, fontWeight: '800', color: Colors.white, letterSpacing: 3 },

  heroTitle: {
    fontSize: Theme.fontSize['3xl'],
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: Theme.spacing.sm,
  },
  heroSubtitle: { fontSize: Theme.fontSize.sm, color: 'rgba(255,255,255,0.55)', fontWeight: '400' },

  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing['2xl'],
    paddingBottom: 40,
    ...Theme.shadow.lg,
  },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm,
    backgroundColor: Colors.saleBg, borderWidth: 1, borderColor: Colors.sale,
    borderRadius: Theme.radius.md, padding: Theme.spacing.md, marginBottom: Theme.spacing.lg,
  },
  errorIcon: { fontSize: 14, color: Colors.sale },
  errorText: { flex: 1, fontSize: Theme.fontSize.sm, color: Colors.sale, fontWeight: '500' },

  fieldGroup: { marginBottom: Theme.spacing.md },
  label: { fontSize: Theme.fontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Theme.radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Theme.spacing.md, height: 52,
    ...Theme.shadow.sm,
  },
  inputFocused: { borderColor: Colors.accent },
  inputError: { borderColor: '#EF4444' },
  inputIcon: { fontSize: 16, marginRight: Theme.spacing.sm, opacity: 0.5 },
  input: { flex: 1, fontSize: Theme.fontSize.md, color: Colors.textPrimary },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 18 },
  matchError: { fontSize: Theme.fontSize.xs, color: '#EF4444', fontWeight: '500', marginTop: 4, marginLeft: 2 },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.sm, marginBottom: Theme.spacing.lg },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  checkmark: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  termsText: { flex: 1, fontSize: Theme.fontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  termsLink: { color: Colors.accent, fontWeight: '600' },

  primaryBtn: {
    backgroundColor: Colors.accent, borderRadius: Theme.radius.md,
    height: 52, alignItems: 'center', justifyContent: 'center',
    ...Theme.shadow.md,
  },
  primaryBtnDisabled: { opacity: 0.65 },
  primaryBtnText: { color: Colors.white, fontSize: Theme.fontSize.lg, fontWeight: '700', letterSpacing: 0.3 },

  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Theme.spacing.xl },
  footerText: { fontSize: Theme.fontSize.md, color: Colors.textSecondary },
  footerLink: { fontSize: Theme.fontSize.md, color: Colors.accent, fontWeight: '700' },
});

export default SignupScreen;
