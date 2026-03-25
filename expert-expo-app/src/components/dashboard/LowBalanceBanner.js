import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ACCENT, CARD, TEXT } from './theme';

/**
 * @param {{
 *   visible: boolean;
 *   threshold?: number;
 *   t: Record<string, string>;
 *   onAddMoney?: () => void;
 *   rechargeLoading?: boolean;
 * }} props
 */
export default function LowBalanceBanner({ visible, threshold = 200, t, onAddMoney, rechargeLoading }) {
  if (!visible) return null;

  const sub = (t.lowBalanceSub || '').replace('{threshold}', String(threshold));

  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <View style={styles.accentBar} />
      <View style={styles.body}>
        <Text style={styles.title}>{t.lowBalanceTitle}</Text>
        <Text style={styles.sub}>{sub}</Text>
        {onAddMoney ? (
          <Pressable
            onPress={onAddMoney}
            disabled={rechargeLoading}
            style={({ pressed }) => [styles.cta, pressed && !rechargeLoading && { opacity: 0.9 }, rechargeLoading && { opacity: 0.75 }]}
            accessibilityRole="button"
            accessibilityLabel={t.addMoney}
          >
            {rechargeLoading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.ctaText}>{t.addMoney}</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.45)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  accentBar: {
    width: 4,
    backgroundColor: '#f97316',
  },
  body: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  title: {
    color: '#fdba74',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  sub: {
    color: TEXT,
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.9,
  },
  cta: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: ACCENT,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  ctaText: {
    color: '#f0fdfa',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
