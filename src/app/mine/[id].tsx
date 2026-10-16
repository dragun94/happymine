import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Confetti } from '@/components/confetti';
import { MoodPicker } from '@/components/mood-picker';
import { Body, Button, Card, Label, Loading, Screen } from '@/components/ui';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useCompleteMine, useDeleteMine, useMine, useMines, useUpdateMood } from '@/hooks/queries';
import { useNow } from '@/hooks/use-now';
import { isContentVisible, isTimeVisible, phaseOf } from '@/lib/mines';
import { getTreeState, PER_TREE } from '@/lib/tree';
import { formatCountdown, formatDay, formatRemaining, formatTime } from '@/lib/time';

const celebratedKey = (id: string) => `celebrated:${id}`;

export default function MineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const now = useNow();
  const { mine, isLoading } = useMine(id);
  const { data: mines = [] } = useMines();
  const complete = useCompleteMine();
  const updateMood = useUpdateMood();
  const remove = useDeleteMine();

  const [confettiKey, setConfettiKey] = useState(0);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [editingMood, setEditingMood] = useState(false);

  const phase = mine ? phaseOf(mine, now) : null;

  // 터진 지뢰를 처음 열면 꽃가루가 한 번 터져요.
  useEffect(() => {
    if (phase !== 'popped' || !id) return;
    AsyncStorage.getItem(celebratedKey(id)).then((seen) => {
      if (!seen) {
        setConfettiKey((k) => k + 1);
        AsyncStorage.setItem(celebratedKey(id), '1');
      }
    });
  }, [phase, id]);

  if (isLoading) return <Loading />;
  if (!mine || !phase) {
    return (
      <Screen header>
        <Body soft>이 지뢰를 찾을 수 없어요. 삭제되었을 수도 있어요.</Body>
        <Button title="홈으로" onPress={() => router.navigate('/')} />
      </Screen>
    );
  }

  const at = new Date(mine.scheduled_at).getTime();
  const timeVisible = isTimeVisible(mine, now);
  const contentVisible = isContentVisible(mine, now);
  const content = contentVisible ? mine.content : '❓ 비밀 미션';

  const onDelete = () => {
    Alert.alert('이 지뢰를 삭제할까요?', '삭제하면 되돌릴 수 없어요.', [
      { text: '그대로 두기', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () =>
          remove.mutate(mine.id, {
            onSuccess: () => router.back(),
            onError: (e) => Alert.alert('삭제하지 못했어요', e.message),
          }),
      },
    ]);
  };

  const onComplete = () => {
    const before = getTreeState(mines).total;
    complete.mutate(
      { id: mine.id, mood: { mood_emoji: emoji, mood_note: note.trim() || null } },
      {
        onSuccess: () => {
          setConfettiKey((k) => k + 1);
          const total = before + 1;
          if (total % PER_TREE === 0) {
            Alert.alert('열매가 맺혔어요 🍎', '행복을 먹고 나무가 다 자랐어요! 다음 행복부터 새 씨앗이 자라요.');
          }
        },
        onError: (e) => Alert.alert('저장하지 못했어요', e.message),
      },
    );
  };

  const startEditMood = () => {
    setEmoji(mine.mood_emoji);
    setNote(mine.mood_note ?? '');
    setEditingMood(true);
  };

  const saveMood = () => {
    updateMood.mutate(
      { id: mine.id, mood: { mood_emoji: emoji, mood_note: note.trim() || null } },
      {
        onSuccess: () => setEditingMood(false),
        onError: (e) => Alert.alert('저장하지 못했어요', e.message),
      },
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen header>
        {(phase === 'waiting' || phase === 'soon') && (
          <Card style={styles.hero}>
            <Text style={styles.bigEmoji}>🎁</Text>
            {phase === 'soon' ? (
              <>
                <Text style={styles.label}>곧 터져요!</Text>
                <Text style={styles.countdown}>{formatCountdown(at - now)}</Text>
              </>
            ) : timeVisible ? (
              <>
                <Text style={styles.label}>
                  {formatDay(mine.scheduled_at)} {formatTime(mine.scheduled_at)}
                </Text>
                <Text style={styles.remaining}>{formatRemaining(at - now)} 뒤에 터져요</Text>
              </>
            ) : (
              <>
                <Text style={styles.label}>{formatDay(mine.scheduled_at)} 어딘가</Text>
                <Text style={styles.remaining}>언제 터질지는 비밀이에요</Text>
              </>
            )}
            <Text style={styles.content}>{content}</Text>
            {phase === 'waiting' && <Body soft>터지기 30분 전부터 카운트다운이 시작돼요.</Body>}
          </Card>
        )}

        {phase === 'popped' && (
          <>
            <Card style={styles.hero}>
              <Text style={styles.bigEmoji}>🎉</Text>
              <Text style={styles.label}>펑! 행복지뢰가 터졌어요</Text>
              <Text style={styles.content}>{mine.content}</Text>
              <Body soft>지금이 아니어도 괜찮아요. 하고 나서 편할 때 체크해 주세요.</Body>
            </Card>
            <Card>
              <Label>기분은 어땠나요?</Label>
              <MoodPicker emoji={emoji} note={note} onEmoji={setEmoji} onNote={setNote} />
            </Card>
            <Button title="했어요! 🌱" onPress={onComplete} loading={complete.isPending} />
          </>
        )}

        {phase === 'done' && (
          <>
            <Card style={styles.hero}>
              <Text style={styles.bigEmoji}>{mine.mood_emoji ?? '🌸'}</Text>
              <Text style={styles.content}>{mine.content}</Text>
              <Body soft>{formatDay(mine.completed_at!)} 에 터뜨린 행복이에요. 나무가 한 뼘 자랐어요 🌱</Body>
            </Card>
            <Card>
              <Label>그때의 기분</Label>
              {editingMood ? (
                <>
                  <MoodPicker emoji={emoji} note={note} onEmoji={setEmoji} onNote={setNote} />
                  <Button title="저장" onPress={saveMood} loading={updateMood.isPending} />
                  <Button title="취소" variant="ghost" onPress={() => setEditingMood(false)} />
                </>
              ) : (
                <>
                  <Body soft={!mine.mood_note}>{mine.mood_note ?? '남긴 기록이 없어요.'}</Body>
                  <Button title="기분 기록 고치기" variant="soft" onPress={startEditMood} />
                </>
              )}
            </Card>
          </>
        )}

        {phase !== 'done' && (
          <Button title="이 지뢰 삭제하기" variant="danger" onPress={onDelete} loading={remove.isPending} />
        )}
      </Screen>
      {confettiKey > 0 && <Confetti key={confettiKey} />}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  bigEmoji: { fontSize: 72 },
  label: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  countdown: { fontSize: 56, fontWeight: '800', color: Colors.text, fontVariant: ['tabular-nums'] },
  remaining: { fontSize: FontSize.md, color: Colors.textSoft },
  content: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, textAlign: 'center' },
});
