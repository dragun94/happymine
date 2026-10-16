import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { isContentVisible, isTimeVisible, phaseOf, type Mine } from '@/lib/mines';
import { formatCountdown, formatDay, formatTime } from '@/lib/time';

/** 지뢰 한 줄. 숨김 설정에 맞춰 시간/내용을 가려서 보여줘요. */
export function MineCard({ mine, now, showDate }: { mine: Mine; now: number; showDate?: boolean }) {
  const phase = phaseOf(mine, now);
  const timeVisible = isTimeVisible(mine, now);
  const contentVisible = isContentVisible(mine, now);

  const when = timeVisible
    ? `${showDate ? formatDay(mine.scheduled_at) + ' ' : ''}${formatTime(mine.scheduled_at)}`
    : `${formatDay(mine.scheduled_at)} 어딘가`;
  const what = contentVisible ? mine.content : mine.hide_time && !timeVisible ? '🎁 무언가 숨어 있어요' : '❓ 비밀 미션';

  const badge = {
    waiting: { text: '기다리는 중', color: Colors.textSoft, bg: Colors.background },
    soon: {
      text: formatCountdown(new Date(mine.scheduled_at).getTime() - now),
      color: Colors.primary,
      bg: Colors.primarySoft,
    },
    popped: { text: '펑! 열어보기', color: Colors.white, bg: Colors.primary },
    done: { text: mine.mood_emoji ?? '완료 🌱', color: Colors.text, bg: Colors.greenSoft },
  }[phase];

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/mine/[id]', params: { id: mine.id } })}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.when}>{when}</Text>
        <Text style={styles.what} numberOfLines={1}>
          {what}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
        <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  when: { fontSize: FontSize.sm, color: Colors.textSoft },
  what: { fontSize: FontSize.md, color: Colors.text, fontWeight: '600' },
  badge: { borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontSize: FontSize.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
