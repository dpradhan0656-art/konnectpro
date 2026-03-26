import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleOAuth';

/**
 * Expert App Auth — STRICT Google OAuth ONLY.
 * No OTP, no passwords, no email/phone manual auth.
 */

const GOOGLE_G_LOGO_PNG = 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png';

const ACCENT = '#0d9488';
const ACCENT_MUTED = '#134e4a';
const BG = '#0f172a';
const CARD = '#1e293b';
const TEXT = '#f8fafc';
const TEXT_MUTED = '#94a3b8';

// If the OAuth custom-tab session never reports back, stop the spinner.
const GOOGLE_SIGNIN_TIMEOUT_MS = 120000;

export default function LoginScreen() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleSpinnerTimeoutRef = useRef(null);

  // Ensure spinner doesn't remain stuck if user returns while Supabase auth event is delayed.
  useEffect(() => {
    if (!googleLoading) return undefined;

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        if (googleSpinnerTimeoutRef.current) {
          clearTimeout(googleSpinnerTimeoutRef.current);
          googleSpinnerTimeoutRef.current = null;
        }
        setGoogleLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [googleLoading]);

  const onContinueWithGoogle = useCallback(async () => {
    if (googleSpinnerTimeoutRef.current) {
      clearTimeout(googleSpinnerTimeoutRef.current);
      googleSpinnerTimeoutRef.current = null;
    }

    setGoogleLoading(true);
    googleSpinnerTimeoutRef.current = setTimeout(() => {
      googleSpinnerTimeoutRef.current = null;
      setGoogleLoading(false);
      Alert.alert(
        'Sign-in is slow',
        'If the Google screen closed but you still see this, close the app completely and open it again — your session may already be saved.'
      );
    }, GOOGLE_SIGNIN_TIMEOUT_MS);

    try {
      const result = await signInWithGoogle(supabase);
      if (result?.cancelled) return;
    } catch (e) {
      Alert.alert('Google sign-in failed', e?.message ?? String(e));
    } finally {
      if (googleSpinnerTimeoutRef.current) {
        clearTimeout(googleSpinnerTimeoutRef.current);
        googleSpinnerTimeoutRef.current = null;
      }
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Partner</Text>
            </View>
            <Text style={styles.title}>Kshatr Experts</Text>
            <Text style={styles.subtitle}>Sign in with Google to access your dashboard.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Authentication</Text>
            <Pressable
              style={({ pressed }) => [
                styles.googleBtn,
                pressed && styles.googleBtnPressed,
                googleLoading && styles.btnDisabled,
              ]}
              onPress={onContinueWithGoogle}
              disabled={googleLoading}
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
          </View>

          <Text style={styles.footer}>No OTP. No passwords. Google OAuth only.</Text>
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
    marginBottom: 12,
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
  btnDisabled: {
    opacity: 0.6,
  },
  footer: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});

