import { useEffect, useRef } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Colors, FontSize, Radius } from '@/constants/theme';

const ITEM = 44;
const VISIBLE = 5; // 가운데 줄이 선택된 값이에요.
const PAD = ITEM * Math.floor(VISIBLE / 2);

/**
 * 손가락으로 위아래로 굴려서 고르는 숫자 바퀴.
 * 폰과 웹 모두에서 같은 모양으로 동작해요.
 */
export function WheelPicker({
  values,
  value,
  onChange,
  format = (v) => String(v).padStart(2, '0'),
  unit,
}: {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  unit?: string;
}) {
  const ref = useRef<ScrollView>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = Math.max(0, values.indexOf(value));
  // 바퀴가 지금 실제로 멈춰 있는 칸
  const wheelAt = useRef(active);

  // 밖에서 값이 바뀌면(초기화 등) 바퀴도 그 자리로 옮겨요.
  useEffect(() => {
    if (wheelAt.current !== active) {
      wheelAt.current = active;
      ref.current?.scrollTo({ y: active * ITEM, animated: false });
    }
  }, [active]);

  useEffect(() => () => {
    if (settle.current) clearTimeout(settle.current);
  }, []);

  const indexAt = (y: number) => Math.min(values.length - 1, Math.max(0, Math.round(y / ITEM)));

  const select = (i: number) => {
    wheelAt.current = i;
    if (values[i] !== value) onChange(values[i]);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const i = indexAt(y);
    if (i !== active) select(i);
    // 손을 뗀 뒤 칸 가운데에 딱 맞춰요 (웹은 자동으로 안 맞춰져서 직접 해요).
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      if (Math.abs(y - i * ITEM) > 1) ref.current?.scrollTo({ y: i * ITEM, animated: true });
    }, 120);
  };

  const onPressItem = (i: number) => {
    select(i);
    ref.current?.scrollTo({ y: i * ITEM, animated: true });
  };

  return (
    <View style={styles.wrap}>
      <View pointerEvents="none" style={styles.highlight} />
      <ScrollView
        ref={ref}
        style={{ height: ITEM * VISIBLE }}
        contentContainerStyle={{ paddingVertical: PAD }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM}
        decelerationRate="fast"
        nestedScrollEnabled
        scrollEventThrottle={16}
        onScroll={onScroll}
        onLayout={() => ref.current?.scrollTo({ y: active * ITEM, animated: false })}>
        {values.map((v, i) => {
          const distance = Math.abs(i - active);
          return (
            <Pressable key={v} onPress={() => onPressItem(i)} style={styles.item}>
              <Text
                style={[
                  styles.text,
                  distance === 0 && styles.textActive,
                  { opacity: distance === 0 ? 1 : distance === 1 ? 0.45 : 0.2 },
                ]}>
                {format(v)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {unit ? (
        <Text pointerEvents="none" style={styles.unit}>
          {unit}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PAD,
    height: ITEM,
    borderRadius: Radius.sm,
    backgroundColor: Colors.yellowSoft,
  },
  item: { height: ITEM, alignItems: 'center', justifyContent: 'center' },
  text: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
    ...(Platform.OS === 'web' ? { userSelect: 'none' as const } : null),
  },
  textActive: { fontSize: FontSize.xl, fontWeight: '800' },
  unit: {
    position: 'absolute',
    right: 16,
    top: PAD,
    lineHeight: ITEM,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textSoft,
  },
});
