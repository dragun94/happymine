import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MoodEmojis } from '@/constants/copy';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { Field } from './ui';

/** 기분 이모지 + 짧은 글 (둘 다 선택 사항) */
export function MoodPicker({
  emoji,
  note,
  onEmoji,
  onNote,
}: {
  emoji: string | null;
  note: string;
  onEmoji: (e: string | null) => void;
  onNote: (n: string) => void;
}) {
  return (
    <View style={{ gap: Spacing.sm }}>
      <View style={styles.row}>
        {MoodEmojis.map((e) => (
          <Pressable
            key={e}
            onPress={() => onEmoji(emoji === e ? null : e)}
            style={[styles.emoji, emoji === e && styles.active]}>
            <Text style={{ fontSize: 26 }}>{e}</Text>
          </Pressable>
        ))}
      </View>
      <Field
        value={note}
        onChangeText={onNote}
        placeholder="어떤 기분이었나요? (안 써도 괜찮아요)"
        multiline
        maxLength={500}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  emoji: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  active: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
});
