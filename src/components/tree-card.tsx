import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { PER_TREE, type TreeState } from '@/lib/tree';
import { Card } from './ui';

/** 나의 나무: 지금 단계와 다음 단계까지 남은 개수 */
export function TreeCard({ tree }: { tree: TreeState }) {
  const { stage, next, progress } = tree;
  const message = next
    ? `${next.name}까지 ${next.min - progress}개 남았어요`
    : '열매가 맺혔어요! 다음 행복부터 새 씨앗이 자라요';

  return (
    <Card style={styles.card}>
      <View style={styles.circle}>
        <Text style={styles.emoji}>{stage.emoji}</Text>
      </View>
      <View style={{ flex: 1, gap: Spacing.xs }}>
        <Text style={styles.title}>나의 나무 · {stage.name}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${(progress / PER_TREE) * 100}%` }]} />
        </View>
        <Text style={styles.count}>
          {progress} / {PER_TREE}
          {tree.forest.length > 0 ? `  ·  숲에 ${tree.forest.length}그루` : ''}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  circle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 40 },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  message: { fontSize: FontSize.sm, color: Colors.textSoft },
  bar: { height: 10, borderRadius: Radius.pill, backgroundColor: Colors.background, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill, backgroundColor: Colors.green },
  count: { fontSize: FontSize.sm, color: Colors.textSoft },
});
