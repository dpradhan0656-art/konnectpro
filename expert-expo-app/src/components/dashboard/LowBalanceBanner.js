import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CARD, TEXT } from './theme';

/**
 * @param {{ visible: boolean; threshold?: number; t: Record<string, string> }} props
 */
export default function LowBalanceBanner({ visible, threshold = 200, t }) {
  if (!visible) return null;

  const sub = (t.lowBalanceSub || '').replace('{threshold}', String(threshold));

  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <View style={styles.accentBar} />
      <View style={styles.body}>
        <Text style={styles.title}>{t.lowBalanceTitle}</Text>
        <Text style={styles.sub}>{sub}</Text>
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
});
