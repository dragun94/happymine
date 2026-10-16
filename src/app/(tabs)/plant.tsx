import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { MonthCalendar } from '@/components/month-calendar';
import { Body, Button, Card, Field, Label, Screen, Segmented, Stepper, Title, ToggleRow } from '@/components/ui';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { usePlantMine, useProfile, useSuggestions } from '@/hooks/queries';
import { pickOne, type Suggestion } from '@/lib/mines';
import { requestPermission } from '@/lib/notifications';
import {
  formatDay,
  formatHour,
  formatTime,
  hourOf,
  kst,
  kstAt,
  kstDateKey,
  pickRandomTime,
  TZ,
} from '@/lib/time';

type WhatMode = 'custom' | 'suggest' | 'surprise';
type TimeMode = 'manual' | 'random';

/** 지금부터 1시간 뒤를 10분 단위로 올림한 시각 */
function defaultTime() {
  const t = kst().add(1, 'hour');
  const minute = Math.ceil(t.minute() / 10) * 10;
  return t.minute(0).add(minute, 'minute');
}

export default function PlantScreen() {
  const { data: profile } = useProfile();
  const { data: suggestions = [] } = useSuggestions();
  const plant = usePlantMine();

  const [whatMode, setWhatMode] = useState<WhatMode>('custom');
  const [content, setContent] = useState('');
  const [picked, setPicked] = useState<Suggestion | null>(null);

  const [dateKey, setDateKey] = useState(() => kstDateKey(defaultTime()));
  const [showCalendar, setShowCalendar] = useState(false);
  const [timeMode, setTimeMode] = useState<TimeMode>('manual');
  const [hour, setHour] = useState(() => defaultTime().hour());
  const [minute, setMinute] = useState(() => defaultTime().minute());
  const [showIosPicker, setShowIosPicker] = useState(false);
  // 직접 바꾸기 전까지는 설정의 기본 랜덤 범위를 써요.
  const [rangeStartEdit, setRangeStart] = useState<number | null>(null);
  const [rangeEndEdit, setRangeEnd] = useState<number | null>(null);
  const rangeStart = rangeStartEdit ?? (profile ? hourOf(profile.random_start) : 10);
  const rangeEnd = rangeEndEdit ?? (profile ? hourOf(profile.random_end) : 21);

  const [hideTime, setHideTime] = useState(false);
  const [hideContent, setHideContent] = useState(false);

  const today = kstDateKey();
  const tomorrow = kstDateKey(kst().add(1, 'day'));
  const pickedTime = kstAt(dateKey, hour, minute);

  const onTimeChange = (date: Date) => {
    const t = kst(date);
    setHour(t.hour());
    setMinute(t.minute());
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: pickedTime.toDate(),
        mode: 'time',
        timeZoneName: TZ,
        onValueChange: (_e, date) => onTimeChange(date),
      });
    } else {
      setShowIosPicker((v) => !v);
    }
  };

  const reset = () => {
    setContent('');
    setPicked(null);
    setHideTime(false);
    setHideContent(false);
    setWhatMode('custom');
  };

  const submit = async () => {
    // 1) 무엇을
    let text = '';
    let suggestionId: number | null = null;
    if (whatMode === 'custom') {
      text = content.trim();
      if (!text) return Alert.alert('어떤 행복을 심을지 적어 주세요 ✍️');
    } else if (whatMode === 'suggest') {
      if (!picked) return Alert.alert('추천 미션을 하나 골라 주세요');
      text = picked.title;
      suggestionId = picked.id;
    } else {
      if (suggestions.length === 0) return Alert.alert('추천 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      const s = pickOne(suggestions);
      text = s.title;
      suggestionId = s.id;
    }

    // 2) 언제
    let at;
    if (timeMode === 'manual') {
      at = pickedTime;
      if (!at.isAfter(kst())) return Alert.alert('이미 지난 시간이에요', '조금 뒤의 시간으로 골라 주세요.');
    } else {
      if (rangeStart >= rangeEnd) return Alert.alert('랜덤 범위의 시작이 끝보다 빨라야 해요');
      at = pickRandomTime(dateKey, rangeStart, rangeEnd);
      if (!at) return Alert.alert('이 범위에는 남은 시간이 없어요', '범위나 날짜를 바꿔 주세요.');
    }

    const contentHidden = whatMode === 'surprise' || hideContent;
    const granted = await requestPermission();

    plant.mutate(
      {
        content: text,
        suggestion_id: suggestionId,
        scheduled_at: at.toISOString(),
        time_mode: timeMode,
        hide_time: hideTime,
        hide_content: contentHidden,
      },
      {
        onSuccess: () => {
          const when = hideTime ? `${formatDay(at)} 어딘가에` : `${formatDay(at)} ${formatTime(at)}에`;
          const extra = granted ? '' : '\n\n알림이 꺼져 있어요. 설정 탭에서 알림을 켜면 시간에 맞춰 알려드릴게요.';
          Alert.alert('행복지뢰를 심었어요 🌱', `${when} 작은 행복이 기다려요.${extra}`);
          reset();
          router.navigate('/');
        },
        onError: (e) => Alert.alert('심지 못했어요', e.message),
      },
    );
  };

  return (
    <Screen>
      <Title>행복지뢰 심기 🌱</Title>

      {/* 1. 무엇을 */}
      <Card>
        <Label>무엇을 할까요?</Label>
        <Segmented
          value={whatMode}
          onChange={setWhatMode}
          options={[
            { value: 'custom', label: '직접 쓰기' },
            { value: 'suggest', label: '추천 받기' },
            { value: 'surprise', label: '🎁 깜짝 추천' },
          ]}
        />
        {whatMode === 'custom' && (
          <Field value={content} onChangeText={setContent} placeholder="예: 빠삐코 먹기" maxLength={100} />
        )}
        {whatMode === 'suggest' && (
          <View style={styles.chips}>
            {suggestions.map((s) => {
              const active = picked?.id === s.id;
              return (
                <Pressable key={s.id} onPress={() => setPicked(s)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && { color: Colors.white }]}>
                    {s.emoji} {s.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {whatMode === 'surprise' && (
          <Body soft>추천 미션 중 하나를 몰래 골라 심어요. 무엇이 나올지는 터지는 순간까지 비밀이에요 🤫</Body>
        )}
      </Card>

      {/* 2. 언제 */}
      <Card>
        <Label>언제 터뜨릴까요?</Label>
        <Segmented
          value={dateKey === today ? 'today' : dateKey === tomorrow ? 'tomorrow' : 'other'}
          onChange={(v) => {
            if (v === 'today') setDateKey(today);
            if (v === 'tomorrow') setDateKey(tomorrow);
            setShowCalendar(v === 'other');
          }}
          options={[
            { value: 'today', label: '오늘' },
            { value: 'tomorrow', label: '내일' },
            { value: 'other', label: dateKey !== today && dateKey !== tomorrow ? formatDay(dateKey) : '날짜 고르기' },
          ]}
        />
        {showCalendar && (
          <MonthCalendar
            selected={dateKey}
            minDate={today}
            onSelect={(d) => {
              setDateKey(d);
              setShowCalendar(false);
            }}
          />
        )}

        <Segmented
          value={timeMode}
          onChange={setTimeMode}
          options={[
            { value: 'manual', label: '시간 정하기' },
            { value: 'random', label: '🎲 랜덤' },
          ]}
        />
        {timeMode === 'manual' ? (
          <>
            <Pressable onPress={openTimePicker} style={styles.timeButton}>
              <Text style={styles.timeText}>{formatTime(pickedTime)}</Text>
            </Pressable>
            {Platform.OS === 'ios' && showIosPicker && (
              <DateTimePicker
                value={pickedTime.toDate()}
                mode="time"
                display="spinner"
                locale="ko-KR"
                timeZoneName={TZ}
                onValueChange={(_e, date) => onTimeChange(date)}
              />
            )}
          </>
        ) : (
          <>
            <Body soft>이 사이 어느 순간에 터져요. 시간은 심는 순간 정해져요.</Body>
            <View style={{ flexDirection: 'row' }}>
              <Stepper label="부터" value={rangeStart} onChange={setRangeStart} min={0} max={23} format={formatHour} />
              <Stepper label="까지" value={rangeEnd} onChange={setRangeEnd} min={1} max={24} format={formatHour} />
            </View>
          </>
        )}
      </Card>

      {/* 3. 숨김 */}
      <Card>
        <Label>살짝 숨겨둘까요?</Label>
        <ToggleRow
          label="시간 숨기기"
          hint="터지기 30분 전까지 언제인지 보이지 않아요"
          value={hideTime}
          onChange={setHideTime}
        />
        <ToggleRow
          label="내용 숨기기"
          hint={whatMode === 'surprise' ? '깜짝 추천은 항상 내용이 숨겨져요' : '터지는 순간까지 무엇인지 보이지 않아요'}
          value={whatMode === 'surprise' || hideContent}
          onChange={setHideContent}
          disabled={whatMode === 'surprise'}
        />
      </Card>

      <Button title="심기 🌱" onPress={submit} loading={plant.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.text },
  timeButton: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.yellowSoft,
  },
  timeText: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
});
