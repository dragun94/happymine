import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Body, Button, Field, Screen, Title } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    if (password.length < 6) {
      Alert.alert('비밀번호는 6자 이상으로 정해 주세요.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('비밀번호가 서로 달라요.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      Alert.alert('가입하지 못했어요', error.message);
      return;
    }
    // 이메일 인증이 켜져 있으면 session 이 없어요 → 코드 입력 화면으로.
    if (!data.session) {
      router.replace({ pathname: '/verify', params: { email: email.trim() } });
    }
  };

  return (
    <Screen>
      <Title>반가워요 👋</Title>
      <Body soft>이메일로 가입하면 어느 폰에서든 내 행복지뢰를 볼 수 있어요.</Body>
      <Field
        value={email}
        onChangeText={setEmail}
        placeholder="이메일"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Field
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호 (6자 이상)"
        secureTextEntry
        autoComplete="new-password"
      />
      <Field
        value={confirm}
        onChangeText={setConfirm}
        placeholder="비밀번호 한 번 더"
        secureTextEntry
        autoComplete="new-password"
      />
      <Button title="가입하기" onPress={signup} loading={loading} disabled={!email || !password} />
      <Button title="로그인으로 돌아가기" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
