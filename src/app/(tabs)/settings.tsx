import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, View } from 'react-native';

import { Body, Button, Card, Label, Screen, Stepper, Title } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useProfile, useUpdateProfile } from '@/hooks/queries';
import { cancelAll, getPermissionGranted, requestPermission, syncNotifications } from '@/lib/notifications';
import { fetchMines } from '@/lib/mines';
import { supabase } from '@/lib/supabase';
import { formatHour, hourOf, hourToTime } from '@/lib/time';
import { useAuth } from '@/providers/auth-provider';

export default function SettingsScreen() {
  const { session } = useAuth();
  const client = useQueryClient();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [granted, setGranted] = useState<boolean | null>(null);
  // 직접 바꾸기 전까지는 저장된 값을 보여줘요.
  const [startEdit, setStart] = useState<number | null>(null);
  const [endEdit, setEnd] = useState<number | null>(null);
  const start = startEdit ?? (profile ? hourOf(profile.random_start) : 10);
  const end = endEdit ?? (profile ? hourOf(profile.random_end) : 21);

  // 폰 설정에서 알림을 바꾸고 돌아와도 상태가 맞게, 화면에 올 때마다 확인해요.
  useFocusEffect(
    useCallback(() => {
      getPermissionGranted().then(setGranted);
    }, []),
  );

  const turnOnNotifications = async () => {
    const ok = await requestPermission();
    setGranted(ok);
    if (ok) {
      await syncNotifications(await fetchMines());
    } else {
      Alert.alert('알림이 꺼져 있어요', '폰 설정에서 행복지뢰(Expo Go) 알림을 켜 주세요.', [
        { text: '나중에', style: 'cancel' },
        { text: '설정 열기', onPress: () => Linking.openSettings() },
      ]);
    }
  };

  const saveRange = () => {
    if (start >= end) {
      Alert.alert('시작이 끝보다 빨라야 해요');
      return;
    }
    updateProfile.mutate(
      { random_start: hourToTime(start), random_end: hourToTime(end) },
      {
        onSuccess: () => Alert.alert('저장했어요 🎲'),
        onError: (e) => Alert.alert('저장하지 못했어요', e.message),
      },
    );
  };

  const signOutLocal = async () => {
    await cancelAll();
    client.clear();
    await supabase.auth.signOut({ scope: 'local' });
  };

  const logout = () => {
    Alert.alert('로그아웃할까요?', '이 폰에 예약된 알림도 함께 꺼져요.', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', onPress: signOutLocal },
    ]);
  };

  const deleteAccount = () => {
    Alert.alert(
      '정말 탈퇴할까요?',
      '심어둔 지뢰, 기분 기록, 나무가 모두 지워지고 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.rpc('delete_my_account');
            if (error) {
              Alert.alert('탈퇴하지 못했어요', error.message);
              return;
            }
            await signOutLocal();
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <Title>설정 ⚙️</Title>

      <Card>
        <Label>알림</Label>
        {granted === null ? null : granted ? (
          <Body soft>알림이 켜져 있어요. 30분 전과 정각에 살짝 알려드릴게요 🔔</Body>
        ) : (
          <>
            <Body soft>알림이 꺼져 있어서 지뢰가 터져도 알려드릴 수 없어요.</Body>
            <Button title="알림 켜기" variant="soft" onPress={turnOnNotifications} />
          </>
        )}
      </Card>

      <Card>
        <Label>랜덤 시간 기본 범위</Label>
        <Body soft>🎲 랜덤으로 심을 때 처음 보이는 범위예요.</Body>
        <View style={{ flexDirection: 'row', marginVertical: Spacing.sm }}>
          <Stepper label="부터" value={start} onChange={setStart} min={0} max={23} format={formatHour} />
          <Stepper label="까지" value={end} onChange={setEnd} min={1} max={24} format={formatHour} />
        </View>
        <Button title="저장" variant="soft" onPress={saveRange} loading={updateProfile.isPending} />
      </Card>

      <Card>
        <Label>계정</Label>
        <Body soft>{session?.user.email}</Body>
        <Button title="로그아웃" variant="soft" onPress={logout} />
        <Button title="회원 탈퇴" variant="danger" onPress={deleteAccount} />
      </Card>
    </Screen>
  );
}
