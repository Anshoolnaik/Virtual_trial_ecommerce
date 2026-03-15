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

const LoginScreen = ({ onNavigate }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const passwordRef = useRef(null);

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) return setError('Please enter your email.');
    if (!password) return setError('Please enter your password.');

    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      signIn(res.data.user, res.data.token);
      onNavigate('home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Hero Section ───────────────────────────────── */}
        <View style={styles.hero}>
          {/* Decorative circles */}
          <View style={[styles.circle, styles.circleTopRight]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
          <View style={[styles.circle, styles.circleCenter]} />

          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>V</Text>
            </View>
            <Text style={styles.brandName}>VOGUE</Text>
            <Text style={styles.brandTag}>VIRTUAL TRY-ON</Text>
          </View>

          <Text style={styles.heroTitle}>Welcome{'\n'}Back 👋</Text>
          <Text style={styles.heroSubtitle}>Sign in to continue your style journey</Text>
        </View>

        {/* ── Form Card ──────────────────────────────────── */}
        <View style={styles.card}>
          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrap, focusedField === 'email' && styles.inputFocused]}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputWrap, focusedField === 'password' && styles.inputFocused]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In  →</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Text style={styles.socialIconApple}></Text>
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => onNavigate('signup')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const HERO_HEIGHT = SCREEN_HEIGHT * 0.42;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.primary },
  scrollContent: { flexGrow: 1 },

  // Hero
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: Colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 52,
    justifyContent: 'flex-end',
    paddingBottom: Theme.spacing['3xl'],
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  circleTopRight: { width: 220, height: 220, top: -60, right: -60 },
  circleBottomLeft: { width: 160, height: 160, bottom: 20, left: -50 },
  circleCenter: { width: 300, height: 300, top: 40, right: -80, backgroundColor: 'rgba(255,56,92,0.07)' },

  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Theme.spacing.xl },
  logoBox: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { color: Colors.white, fontSize: 20, fontWeight: '800' },
  brandName: { fontSize: Theme.fontSize.lg, fontWeight: '800', color: Colors.white, letterSpacing: 3 },
  brandTag: { fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, marginTop: 2 },

  heroTitle: {
    fontSize: Theme.fontSize['4xl'],
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: Theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: Theme.fontSize.md,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '400',
  },

  // Card
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

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Colors.saleBg,
    borderWidth: 1,
    borderColor: Colors.sale,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  errorIcon: { fontSize: 14, color: Colors.sale },
  errorText: { flex: 1, fontSize: Theme.fontSize.sm, color: Colors.sale, fontWeight: '500' },

  // Fields
  fieldGroup: { marginBottom: Theme.spacing.lg },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: Theme.fontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  forgotText: { fontSize: Theme.fontSize.sm, color: Colors.accent, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Theme.spacing.md,
    height: 52,
    ...Theme.shadow.sm,
  },
  inputFocused: { borderColor: Colors.accent },
  inputIcon: { fontSize: 16, marginRight: Theme.spacing.sm, opacity: 0.5 },
  input: { flex: 1, fontSize: Theme.fontSize.md, color: Colors.textPrimary },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 18 },

  // Primary button
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Theme.radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.sm,
    ...Theme.shadow.md,
  },
  primaryBtnDisabled: { opacity: 0.65 },
  primaryBtnText: { color: Colors.white, fontSize: Theme.fontSize.lg, fontWeight: '700', letterSpacing: 0.3 },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Theme.spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: Theme.fontSize.sm, color: Colors.textMuted, marginHorizontal: Theme.spacing.md, fontWeight: '500' },

  // Social
  socialRow: { flexDirection: 'row', gap: Theme.spacing.md },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    height: 48,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    ...Theme.shadow.sm,
  },
  socialIcon: { fontSize: 16, fontWeight: '800', color: '#EA4335' },
  socialIconApple: { fontSize: 18, color: Colors.textPrimary },
  socialText: { fontSize: Theme.fontSize.sm, fontWeight: '600', color: Colors.textPrimary },

  // Footer
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Theme.spacing.xl },
  footerText: { fontSize: Theme.fontSize.md, color: Colors.textSecondary },
  footerLink: { fontSize: Theme.fontSize.md, color: Colors.accent, fontWeight: '700' },
});

export default LoginScreen;
