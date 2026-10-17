import { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { PER_TREE, TreeStages, type TreeState } from '@/lib/tree';

// 단계마다 식물 크기(글자 크기). 같은 단계 안에서도 조금씩 커져요.
const STAGE_SIZE = { seed: 64, sprout: 104, flower: 136, fruit: 164 } as const;

/** 나의 나무: 홈 화면 절반 정도를 차지하는 작은 정원 */
export function TreeCard({ tree }: { tree: TreeState }) {
  const { height } = useWindowDimensions();
  const { stage, next, progress } = tree;
  const message = next
    ? `${next.name}까지 ${next.min - progress}개 남았어요`
    : '열매가 맺혔어요! 다음 행복부터 새 씨앗이 자라요';

  // 다음 단계까지 얼마나 왔는지만큼 살짝 더 커져요.
  const stageProgress = next ? (progress - stage.min) / (next.min - stage.min) : 1;
  const size = STAGE_SIZE[stage.key] * (1 + 0.12 * stageProgress);
  const stageIndex = TreeStages.findIndex((s) => s.key === stage.key);

  // 바람에 살랑살랑 흔들려요.
  const sway = useSharedValue(0);
  useEffect(() => {
    sway.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [sway]);
  const swayStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sway.value * 3}deg` }, { scale: 1 + Math.abs(sway.value) * 0.02 }],
  }));

  return (
    <View style={[styles.card, { height: Math.max(340, height * 0.48) }]}>
      <View style={styles.header}>
        <Text style={styles.title}>나의 나무 · {stage.name}</Text>
        {tree.forest.length > 0 && <Text style={styles.forest}>🌳 숲에 {tree.forest.length}그루</Text>}
      </View>

      <View style={styles.garden}>
        <Text style={styles.sun}>☀️</Text>
        <Animated.View style={[styles.plantWrap, swayStyle]}>
          <Text style={{ fontSize: size, lineHeight: size * 1.2 }}>{stage.emoji}</Text>
        </Animated.View>
        <View style={styles.soil} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.steps}>
          {TreeStages.map((s, i) => (
            <View key={s.key} style={styles.step}>
              <View style={[styles.stepDot, i <= stageIndex && styles.stepDotDone]}>
                <Text style={{ fontSize: 18, opacity: i <= stageIndex ? 1 : 0.35 }}>{s.emoji}</Text>
              </View>
              <Text style={[styles.stepName, i === stageIndex && styles.stepNameNow]}>{s.name}</Text>
            </View>
          ))}
        </View>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${(progress / PER_TREE) * 100}%` }]} />
        </View>
        <Text style={styles.count}>
          {progress} / {PER_TREE}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.greenSoft,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  forest: { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '600' },
  garden: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  sun: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, fontSize: 32 },
  plantWrap: { alignItems: 'center', marginBottom: -Spacing.md, zIndex: 1 },
  soil: {
    width: '70%',
    height: 36,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: Colors.soil,
  },
  footer: { gap: Spacing.sm, paddingTop: Spacing.sm },
  message: { fontSize: FontSize.md, color: Colors.text, textAlign: 'center', fontWeight: '600' },
  steps: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.sm },
  step: { alignItems: 'center', gap: 2 },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  stepDotDone: { backgroundColor: Colors.yellowSoft },
  stepName: { fontSize: 11, color: Colors.textSoft },
  stepNameNow: { color: Colors.text, fontWeight: '800' },
  bar: { height: 10, borderRadius: Radius.pill, backgroundColor: Colors.white, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill, backgroundColor: Colors.green },
  count: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center' },
});
