import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Body, Button, Field, Screen, Title } from '@/components/ui';
import { AuthConfig } from '@/constants/config';
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
    // session 이 있으면 바로 로그인된 거예요 → 자동으로 홈으로 이동해요.
    if (data.session) return;

    // session 이 없으면 Supabase 에서 이메일 인증(Confirm email)이 켜져 있다는 뜻이에요.
    if (AuthConfig.emailOtp) {
      router.replace({ pathname: '/verify', params: { email: email.trim() } });
    } else {
      Alert.alert(
        '바로 로그인되지 않았어요',
        'Supabase 의 "Confirm email" 설정이 켜져 있는지 확인해 주세요. (개발 중에는 꺼 두어야 해요)',
      );
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
