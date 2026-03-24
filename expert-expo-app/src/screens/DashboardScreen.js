import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const BG = '#0f172a';
const CARD = '#1e293b';
const TEXT = '#f8fafc';
const ACCENT = '#0d9488';

/**
 * @param {{ expert: { name?: string | null; email?: string | null } | null }} props
 */
export default function DashboardScreen({ expert }) {
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Partner</Text>
        </View>
        <Text style={styles.title}>Expert dashboard</Text>
        <Text style={styles.sub}>
          Signed in as {expert?.name || expert?.email || 'Expert'}.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Next steps</Text>
          <Text style={styles.cardBody}>
            Navigation and job tools will plug in here. Your Supabase session is active.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.9 }]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color={ACCENT} />
          ) : (
            <Text style={styles.outlineBtnText}>Sign out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#134e4a',
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
    fontSize: 26,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 28,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 21,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '700',
  },
});
