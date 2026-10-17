import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { to12h, to24h } from '@/lib/time';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * '오전 11:20' 을 누르면 오전/오후를 고르고 시/분을 직접 적어서 바꿀 수 있어요.
 * 시를 1~11 로 적으면 오전, 12~24 로 적으면 오후가 자동으로 골라져요 (12 는 낮 12시, 24 는 밤 12시).
 * 숫자를 적은 뒤 오전/오후 버튼을 눌러 바꿀 수도 있어요. 분은 0~59.
 */
export function TimeInput({
  label,
  hour,
  minute,
  onChange,
}: {
  label: string;
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [pm, setPm] = useState(false);
  const [h, setH] = useState('');
  const [m, setM] = useState('');
  const minuteRef = useRef<TextInput>(null);

  const start = () => {
    const t = to12h(hour);
    setPm(t.pm);
    setH(String(t.h12));
    setM(pad(minute));
    setEditing(true);
  };

  const done = () => {
    const nh = Number(h);
    const nm = Number(m || 0);
    if (h === '' || !Number.isInteger(nh) || nh < 0 || nh > 24) {
      return Alert.alert('시는 0부터 24 사이로 적어 주세요', '예: 오후 3시는 3 (오후 선택) 또는 15');
    }
    if (!Number.isInteger(nm) || nm < 0 || nm > 59) {
      return Alert.alert('분은 0부터 59 사이로 적어 주세요');
    }
    // 13~24 는 그 자체로 시각이에요. 0 과 24 는 밤 12시.
    const hour24 = nh === 0 || nh === 24 ? 0 : nh >= 13 ? nh : to24h(pm, nh);
    onChange(hour24, nm);
    setEditing(false);
  };

  if (!editing) {
    return (
      <Pressable onPress={start} style={styles.display} hitSlop={8}>
        <Text style={styles.displayText}>{label}</Text>
        <Text style={styles.pencil}>✏️</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.ampm}>
        {[false, true].map((v) => (
          <Pressable key={String(v)} onPress={() => setPm(v)} style={[styles.ampmItem, pm === v && styles.ampmActive]}>
            <Text style={[styles.ampmText, pm === v && { color: Colors.white }]}>{v ? '오후' : '오전'}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={h}
        onChangeText={(t) => {
          const v = t.replace(/\D/g, '').slice(0, 2);
          setH(v);
          const n = Number(v);
          // 1~11 은 오전, 12~24 는 오후로 자동으로 골라요.
          if (n >= 1 && n <= 11) setPm(false);
          if (n >= 12 && n <= 24) setPm(true);
          // 두 자리를 다 적거나, 3~9 처럼 뒤에 숫자가 더 올 수 없으면 분 칸으로 넘어가요.
          if (v.length === 2 || n >= 3) minuteRef.current?.focus();
        }}
        keyboardType="number-pad"
        maxLength={2}
        autoFocus
        selectTextOnFocus
        returnKeyType="next"
        onSubmitEditing={() => minuteRef.current?.focus()}
        style={styles.input}
      />
      <Text style={styles.unit}>시</Text>
      <TextInput
        ref={minuteRef}
        value={m}
        onChangeText={(t) => setM(t.replace(/\D/g, '').slice(0, 2))}
        keyboardType="number-pad"
        maxLength={2}
        selectTextOnFocus
        returnKeyType="done"
        onSubmitEditing={done}
        style={styles.input}
      />
      <Text style={styles.unit}>분</Text>
      <Pressable onPress={done} style={styles.doneButton} hitSlop={8}>
        <Text style={styles.doneText}>완료</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  display: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
  },
  displayText: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  pencil: { fontSize: FontSize.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  ampm: { gap: 4, marginRight: 4 },
  ampmItem: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ampmActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  ampmText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  input: {
    width: 56,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    textAlign: 'center',
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  unit: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textSoft },
  doneButton: {
    marginLeft: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
  doneText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
});
