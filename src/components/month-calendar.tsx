import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { kst, kstDateKey } from '@/lib/time';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 한 달 달력. selected 날짜를 강조하고, marks 에 있는 날짜 아래에 표시를 달아요.
 * minDate 보다 이전 날짜는 고를 수 없어요.
 */
export function MonthCalendar({
  selected,
  onSelect,
  marks = {},
  minDate,
}: {
  selected: string;
  onSelect: (dateKey: string) => void;
  marks?: Record<string, string>;
  minDate?: string;
}) {
  const [month, setMonth] = useState(() => kst(selected).startOf('month'));
  const today = kstDateKey();

  const first = month.startOf('month');
  const days: (string | null)[] = Array(first.day()).fill(null);
  for (let d = 1; d <= month.daysInMonth(); d++) {
    days.push(first.date(d).format('YYYY-MM-DD'));
  }
  while (days.length % 7 !== 0) days.push(null);

  const canGoBack = !minDate || month.isAfter(kst(minDate), 'month');

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={() => canGoBack && setMonth(month.subtract(1, 'month'))} hitSlop={12}>
          <Text style={[styles.nav, !canGoBack && { opacity: 0.2 }]}>‹</Text>
        </Pressable>
        <Text style={styles.month}>{month.format('YYYY년 M월')}</Text>
        <Pressable onPress={() => setMonth(month.add(1, 'month'))} hitSlop={12}>
          <Text style={styles.nav}>›</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {WEEK.map((w, i) => (
          <Text key={w} style={[styles.week, i === 0 && { color: Colors.danger }]}>
            {w}
          </Text>
        ))}
        {days.map((key, i) => {
          if (!key) return <View key={`e${i}`} style={styles.cell} />;
          const disabled = !!minDate && key < minDate;
          const isSelected = key === selected;
          const mark = marks[key];
          return (
            <Pressable
              key={key}
              disabled={disabled}
              onPress={() => onSelect(key)}
              style={styles.cell}>
              <View
                style={[
                  styles.day,
                  key === today && styles.today,
                  isSelected && styles.selected,
                ]}>
                <Text
                  style={[
                    styles.dayText,
                    disabled && { opacity: 0.25 },
                    isSelected && { color: Colors.white },
                  ]}>
                  {Number(key.slice(8))}
                </Text>
              </View>
              <Text style={styles.mark}>{mark ?? ' '}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  nav: { fontSize: 28, color: Colors.primary, paddingHorizontal: Spacing.sm },
  month: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  week: { width: `${100 / 7}%`, textAlign: 'center', fontSize: FontSize.sm, color: Colors.textSoft, marginBottom: 6 },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  today: { backgroundColor: Colors.yellowSoft },
  selected: { backgroundColor: Colors.primary },
  dayText: { fontSize: FontSize.md, color: Colors.text },
  mark: { fontSize: 11, height: 16, lineHeight: 16 },
});
