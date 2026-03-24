import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleOAuth';

/** Official multicolor “G” (PNG) — Google branding guidelines allow this asset in sign-in buttons. */
const GOOGLE_G_LOGO_PNG =
  'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png';

const ACCENT = '#0d9488';
const ACCENT_MUTED = '#134e4a';
const BG = '#0f172a';
const CARD = '#1e293b';
const TEXT = '#f8fafc';
const TEXT_MUTED = '#94a3b8';

/** Normalize phone toward E.164: trim; if digits only and 10 digits, prefix +91 (India default). */
function normalizePhoneInput(raw) {
  const t = raw.trim().replace(/\s+/g, '');
  if (!t) return '';
  if (t.startsWith('+')) return t;
  const digits = t.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  return t.startsWith('91') && digits.length >= 10 ? `+${digits}` : `+${digits}`;
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function LoginScreen() {
  const [mode, setMode] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const sendCode = useCallback(async () => {
    if (mode === 'email') {
      if (!isValidEmail(email)) {
        Alert.alert('Invalid email', 'Please enter a valid email address.');
        return;
      }
    } else {
      const p = normalizePhoneInput(phone);
      if (p.length < 10) {
        Alert.alert('Invalid phone', 'Use full number with country code, e.g. +919876543210.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'email') {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: false },
        });
        if (error) throw error;
      } else {
        const p = normalizePhoneInput(phone);
        const { error } = await supabase.auth.signInWithOtp({
          phone: p,
          options: { shouldCreateUser: false },
        });
        if (error) throw error;
      }
      setOtpSent(true);
      setOtp('');
      Alert.alert(
        'Check your device',
        mode === 'email'
          ? 'We sent a login code to your email.'
          : 'We sent an SMS code to your phone.'
      );
    } catch (e) {
      Alert.alert('Could not send code', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [email, mode, phone]);

  const verifyAndSignIn = useCallback(async () => {
    const code = otp.trim();
    if (code.length < 4) {
      Alert.alert('Invalid code', 'Enter the code you received.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'email') {
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: code,
          type: 'email',
        });
        if (error) throw error;
      } else {
        const p = normalizePhoneInput(phone);
        const { error } = await supabase.auth.verifyOtp({
          phone: p,
          token: code,
          type: 'sms',
        });
        if (error) throw error;
      }
      /*
       * OLD trial: local success alert before central expert validation + Dashboard routing.
       * Alert.alert('Signed in', 'Session saved on this device.');
       */
    } catch (e) {
      Alert.alert('Verification failed', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [email, mode, otp, phone]);

  const onContinueWithGoogle = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle(supabase);
      if (result?.cancelled) return;
      /*
       * OLD trial: showed an alert here on success. Session + expert check now run in App.js
       * (validateExpertAccess); user is routed to DashboardScreen when approved.
       * Alert.alert('Google', 'Signed in');
       */
    } catch (e) {
      Alert.alert('Google sign-in failed', e?.message ?? String(e));
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Partner</Text>
            </View>
            <Text style={styles.title}>Kshatr Experts</Text>
            <Text style={styles.subtitle}>Sign in with the email or phone registered on your expert profile.</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.googleBtn,
              pressed && styles.googleBtnPressed,
              (loading || googleLoading) && styles.btnDisabled,
            ]}
            onPress={onContinueWithGoogle}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#1e293b" />
            ) : (
              <>
                <Image source={{ uri: GOOGLE_G_LOGO_PNG }} style={styles.googleIcon} resizeMode="contain" />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or use email / phone code</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Sign in with</Text>
            <View style={styles.segment}>
              <Pressable
                onPress={() => {
                  setMode('email');
                  setOtpSent(false);
                  setOtp('');
                }}
                style={[styles.segmentBtn, mode === 'email' && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentText, mode === 'email' && styles.segmentTextActive]}>Email</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMode('phone');
                  setOtpSent(false);
                  setOtp('');
                }}
                style={[styles.segmentBtn, mode === 'phone' && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentText, mode === 'phone' && styles.segmentTextActive]}>Phone</Text>
              </Pressable>
            </View>

            {mode === 'email' ? (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@company.com"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  editable={!otpSent}
                />
              </View>
            ) : (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Phone (E.164)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  editable={!otpSent}
                />
                <Text style={styles.hint}>10-digit India numbers get +91 automatically if you omit the country code.</Text>
              </View>
            )}

            {!otpSent ? (
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed, loading && styles.btnDisabled]}
                onPress={sendCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send login code</Text>
                )}
              </Pressable>
            ) : (
              <>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>One-time code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter code"
                    placeholderTextColor={TEXT_MUTED}
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={12}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed, loading && styles.btnDisabled]}
                  onPress={verifyAndSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Verify & sign in</Text>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  style={styles.linkBtn}
                >
                  <Text style={styles.linkText}>Use a different {mode === 'email' ? 'email' : 'number'}</Text>
                </Pressable>
              </>
            )}
          </View>

          <Text style={styles.footer}>Uses the same Supabase project as Kshatr.com — add keys in `.env`.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    marginTop: 16,
    marginBottom: 28,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT_MUTED,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: TEXT_MUTED,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  googleBtnPressed: {
    opacity: 0.92,
  },
  googleIcon: {
    width: 22,
    height: 22,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: ACCENT,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  segmentTextActive: {
    color: '#fff',
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 16,
    color: TEXT,
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryBtnPressed: {
    opacity: 0.9,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  linkBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});
