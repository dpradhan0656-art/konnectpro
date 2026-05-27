import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

const BG = '#0f172a';
const CARD = '#1e293b';
const BORDER = '#334155';
const ACCENT = '#0d9488';
const TEXT = '#f8fafc';
const TEXT_MUTED = '#94a3b8';
const DANGER = '#f87171';

/**
 * Reviewer access:
 * Email: expert.review@kshatryx.com
 * Password: Kshatr@7979
 *
 * This fallback is only for Google Play review/testing and is gated by
 * EXPO_PUBLIC_ENABLE_REVIEWER_LOGIN=true.
 */

/**
 * @param {{
 *   visible: boolean;
 *   onClose: () => void;
 *   onSession: (session: import('@supabase/supabase-js').Session | null | undefined) => Promise<void> | void;
 * }} props
 */
export default function ReviewerLoginModal({ visible, onClose, onSession }) {
  const [email, setEmail] = useState('expert.review@kshatryx.com');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = useCallback(async () => {
    if (submitting) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please enter reviewer email and password.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        const msg = String(authError.message || '').toLowerCase();
        if (msg.includes('invalid') || msg.includes('credentials')) {
          throw new Error('Invalid reviewer credentials. Please check email/password.');
        }
        throw authError;
      }

      await Promise.resolve(onSession(data?.session ?? null));
      onClose();
    } catch (e) {
      const message = e?.message || String(e);
      const friendly = /network|fetch|timeout/i.test(message)
        ? 'Network issue. Please check internet connection and try again.'
        : message;
      setError(friendly);
    } finally {
      setSubmitting(false);
    }
  }, [email, onClose, onSession, password, submitting]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.kicker}>Google Play Review</Text>
          <Text style={styles.title}>Reviewer Login</Text>
          <Text style={styles.subtitle}>
            Use this only for Play Store review/testing. Normal experts should continue with Google.
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            placeholder="expert.review@kshatryx.com"
            placeholderTextColor="#64748b"
            style={styles.input}
            editable={!submitting}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            placeholder="Password"
            placeholderTextColor="#64748b"
            style={styles.input}
            editable={!submitting}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={submit}
            disabled={submitting}
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, submitting && styles.disabled]}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Login</Text>}
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={submitting}
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed, submitting && styles.disabled]}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(2, 6, 23, 0.82)',
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 22,
  },
  kicker: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: TEXT,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 18,
  },
  label: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BG,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 14,
    color: TEXT,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  error: {
    color: DANGER,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelText: {
    color: TEXT_MUTED,
    fontWeight: '700',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
});
