import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MineCard } from '@/components/mine-card';
import { TreeCard } from '@/components/tree-card';
import { Body, Button, Card, Label, Loading } from '@/components/ui';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useMines } from '@/hooks/queries';
import { useNow } from '@/hooks/use-now';
import { isContentVisible, isTimeVisible, phaseOf, sortForDisplay, type Mine } from '@/lib/mines';
import { getTreeState } from '@/lib/tree';
import { formatCountdown, formatDay, formatRemaining, formatTime, kstDateKey } from '@/lib/time';

export default function HomeScreen() {
  const now = useNow();
  const { data: mines, isLoading, refetch, isRefetching } = useMines();

  if (isLoading || !mines) return <Loading />;

  const today = kstDateKey(now);
  const tree = getTreeState(mines);
  const popped = mines.filter((m) => phaseOf(m, now) === 'popped');
  const upcoming = mines.filter((m) => {
    const p = phaseOf(m, now);
    return p === 'waiting' || p === 'soon';
  });
  // 시간이 숨겨진 지뢰는 '다음 지뢰'로 고르지 않아요 (30분 전부터는 드러나요).
  const next = upcoming.find((m) => isTimeVisible(m, now));
  const todayMines = sortForDisplay(
    mines.filter((m) => kstDateKey(m.scheduled_at) === today),
    now,
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}>
        <View style={{ gap: 2 }}>
          <Text style={styles.date}>{formatDay(today)}</Text>
          <Text style={styles.greeting}>오늘도 작은 행복을 기다려요 ☀️</Text>
        </View>

        {next ? <NextMine mine={next} now={now} /> : <EmptyNext />}

        {popped.length > 0 && (
          <View style={{ gap: Spacing.sm }}>
            <Label>펑! 터진 행복이 기다려요</Label>
            {popped.map((m) => (
              <MineCard key={m.id} mine={m} now={now} showDate />
            ))}
          </View>
        )}

        <TreeCard tree={tree} />

        <View style={{ gap: Spacing.sm }}>
          <Label>오늘의 행복지뢰</Label>
          {todayMines.length === 0 ? (
            <Body soft>오늘은 아직 심은 지뢰가 없어요.</Body>
          ) : (
            todayMines.map((m) => <MineCard key={m.id} mine={m} now={now} />)
          )}
        </View>

        <Button title="🌱 행복지뢰 심기" onPress={() => router.navigate('/plant')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function NextMine({ mine, now }: { mine: Mine; now: number }) {
  const left = new Date(mine.scheduled_at).getTime() - now;
  const soon = phaseOf(mine, now) === 'soon';
  const what = isContentVisible(mine, now) ? mine.content : '❓ 비밀 미션';
  const isToday = kstDateKey(mine.scheduled_at) === kstDateKey(now);

  return (
    <Pressable onPress={() => router.push({ pathname: '/mine/[id]', params: { id: mine.id } })}>
      <Card style={[styles.next, soon && { backgroundColor: Colors.primarySoft }]}>
        <Text style={styles.nextLabel}>{soon ? '곧 터져요!' : '다음 행복지뢰까지'}</Text>
        <Text style={styles.nextTime}>{soon ? formatCountdown(left) : formatRemaining(left)}</Text>
        <Text style={styles.nextWhat}>
          {isToday ? '' : `${formatDay(mine.scheduled_at)} `}
          {formatTime(mine.scheduled_at)} · {what}
        </Text>
      </Card>
    </Pressable>
  );
}

function EmptyNext() {
  return (
    <Card style={styles.next}>
      <Text style={{ fontSize: 40 }}>🎁</Text>
      <Text style={styles.nextWhat}>기다리는 지뢰가 없어요. 작은 행복을 하나 심어볼까요?</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl * 2, gap: Spacing.lg },
  date: { fontSize: FontSize.sm, color: Colors.textSoft },
  greeting: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  next: { alignItems: 'center', paddingVertical: Spacing.lg, borderRadius: Radius.lg },
  nextLabel: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '700' },
  nextTime: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  nextWhat: { fontSize: FontSize.md, color: Colors.textSoft, textAlign: 'center' },
});
