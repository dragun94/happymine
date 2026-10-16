import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Body, Button, Field, Screen, Title } from '@/components/ui';
import { supabase } from '@/lib/supabase';

/** 비밀번호 재설정: 메일로 코드 받기 → 코드 + 새 비밀번호 입력 */
export default function ForgotScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) {
      Alert.alert('잠시 후 다시 시도해 주세요', error.message);
      return;
    }
    setSent(true);
  };

  const reset = async () => {
    if (password.length < 6) {
      Alert.alert('비밀번호는 6자 이상으로 정해 주세요.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'recovery',
    });
    if (error) {
      setLoading(false);
      Alert.alert('코드가 맞지 않아요', '메일의 코드를 다시 확인해 주세요.');
      return;
    }
    // 코드가 맞으면 로그인된 상태가 되고, 새 비밀번호를 저장해요.
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) Alert.alert('비밀번호를 바꾸지 못했어요', updateError.message);
  };

  return (
    <Screen>
      <Title>비밀번호 다시 정하기</Title>
      {!sent ? (
        <>
          <Body soft>가입한 이메일로 인증 코드를 보내 드릴게요.</Body>
          <Field
            value={email}
            onChangeText={setEmail}
            placeholder="이메일"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button title="코드 받기" onPress={sendCode} loading={loading} disabled={!email} />
        </>
      ) : (
        <>
          <Body soft>{email} 로 보낸 코드와 새 비밀번호를 입력해 주세요.</Body>
          <Field
            value={code}
            onChangeText={setCode}
            placeholder="인증 코드"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={10}
          />
          <Field
            value={password}
            onChangeText={setPassword}
            placeholder="새 비밀번호 (6자 이상)"
            secureTextEntry
            autoComplete="new-password"
          />
          <Button title="바꾸기" onPress={reset} loading={loading} disabled={!code || !password} />
        </>
      )}
      <Button title="로그인으로 돌아가기" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
