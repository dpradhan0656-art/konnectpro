import React from 'react';
import { Alert, Linking, StyleSheet, Text, View, Pressable } from 'react-native';

/**
 * Shown when a Google user signs in successfully but cannot access the dashboard:
 * - no expert profile linked yet
 * - expert exists but not approved
 */
export default function AccessGateScreen({ title, message, onSignOut }) {
  const REGISTRATION_URL = 'https://kshatr.com/register-expert';

  const onOpenRegistration = async () => {
    try {
      const canOpen = await Linking.canOpenURL(REGISTRATION_URL);
      if (canOpen) {
        await Linking.openURL(REGISTRATION_URL);
      } else {
        Alert.alert('Unable to open link', 'Please complete expert registration on the web.');
      }
    } catch (e) {
      Alert.alert('Unable to open link', 'Please complete expert registration on the web.');
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Kshatr Experts</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={{ height: 14 }} />

      <Pressable style={styles.primaryBtn} onPress={onOpenRegistration}>
        <Text style={styles.primaryBtnText}>Complete Registration</Text>
      </Pressable>

      <View style={{ height: 10 }} />

      <Pressable
        style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.92 }]}
        onPress={onSignOut}
      >
        <Text style={styles.secondaryBtnText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#134e4a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 18,
  },
  badgeText: {
    color: '#0d9488',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  secondaryBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
});

