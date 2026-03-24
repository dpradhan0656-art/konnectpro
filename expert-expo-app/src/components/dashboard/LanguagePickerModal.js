import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EXPERT_VOICE_DICT, LANGUAGE_ORDER } from '../../constants/expertVoiceDict';
import { ACCENT, BG, BORDER, CARD, TEXT, TEXT_MUTED } from './theme';

/**
 * @param {{ visible: boolean; onClose: () => void; currentLang: string; onSelect: (code: string) => void; title: string }} props
 */
export default function LanguagePickerModal({ visible, onClose, currentLang, onSelect, title }) {
  const data = LANGUAGE_ORDER.map((code) => ({
    code,
    label: EXPERT_VOICE_DICT[code]?.name || code,
  }));

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <FlatList
            data={data}
            keyExtractor={(item) => item.code}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const active = item.code === currentLang;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item.code);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    active && styles.rowActive,
                    pressed && { opacity: 0.88 },
                  ]}
                >
                  <Text style={[styles.rowText, active && styles.rowTextActive]}>{item.label}</Text>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    maxHeight: '80%',
    paddingBottom: 12,
  },
  sheetTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },
  list: {
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  rowActive: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.35)',
  },
  rowText: {
    color: TEXT_MUTED,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  rowTextActive: {
    color: TEXT,
  },
  check: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: '800',
  },
});
