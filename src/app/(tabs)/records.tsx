import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MineCard } from '@/components/mine-card';
import { MonthCalendar } from '@/components/month-calendar';
import { Body, Card, Label, Loading, Screen, Title } from '@/components/ui';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useMines } from '@/hooks/queries';
import { useNow } from '@/hooks/use-now';
import { sortForDisplay } from '@/lib/mines';
import { getTreeState } from '@/lib/tree';
import { formatDay, kst, kstDateKey } from '@/lib/time';

export default function RecordsScreen() {
  const now = useNow(30_000);
  const { data: mines, isLoading } = useMines();
  const [selected, setSelected] = useState(() => kstDateKey());

  if (isLoading || !mines) return <Loading />;

  const tree = getTreeState(mines);

  // 달력 표시: 완료한 날은 기분 이모지(없으면 🌸), 아직인 지뢰가 있는 날은 점
  const marks: Record<string, string> = {};
  for (const m of mines) {
    const key = kstDateKey(m.scheduled_at);
    if (m.completed_at) {
      if (!marks[key] || marks[key] === '•') marks[key] = m.mood_emoji ?? '🌸';
    } else if (!marks[key]) {
      marks[key] = '•';
    }
  }

  const dayMines = sortForDisplay(
    mines.filter((m) => kstDateKey(m.scheduled_at) === selected),
    now,
  );

  return (
    <Screen>
      <Title>나의 기록 📅</Title>

      <Card style={styles.summary}>
        <Text style={styles.summaryNumber}>{tree.total}</Text>
        <Body soft>지금까지 터뜨린 행복</Body>
      </Card>

      <MonthCalendar selected={selected} onSelect={setSelected} marks={marks} />

      <View style={{ gap: Spacing.sm }}>
        <Label>{formatDay(selected)}</Label>
        {dayMines.length === 0 ? (
          <Body soft>이날은 심은 지뢰가 없어요.</Body>
        ) : (
          dayMines.map((m) => (
            <View key={m.id} style={{ gap: 4 }}>
              <MineCard mine={m} now={now} />
              {m.completed_at && m.mood_note ? <Text style={styles.note}>“{m.mood_note}”</Text> : null}
            </View>
          ))
        )}
      </View>

      <Card>
        <Label>나의 숲 🌳</Label>
        {tree.forest.length === 0 ? (
          <Body soft>열매까지 키운 나무가 여기에 모여요. 지금 나무는 {tree.stage.name} 단계예요.</Body>
        ) : (
          tree.forest.map((t) => (
            <Text key={t.number} style={styles.tree}>
              🌳 {t.number}번째 나무 · {kst(t.grownAt).format('YYYY년 M월 D일')} 열매
            </Text>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { alignItems: 'center', backgroundColor: Colors.yellowSoft, borderColor: Colors.yellowSoft },
  summaryNumber: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  note: { fontSize: FontSize.sm, color: Colors.textSoft, paddingHorizontal: Spacing.md },
  tree: { fontSize: FontSize.md, color: Colors.text },
});
