import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Body, Button, Field, Screen, Title } from '@/components/ui';
import { supabase } from '@/lib/supabase';

/** 가입 인증: 메일로 받은 숫자 코드를 입력해요 */
export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' });
    setLoading(false);
    if (error) Alert.alert('코드가 맞지 않아요', '메일의 코드를 다시 확인하거나, 새 코드를 받아 주세요.');
    // 성공하면 자동으로 로그인되어 홈으로 이동해요.
  };

  const resend = async () => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    Alert.alert(error ? '잠시 후 다시 시도해 주세요' : '새 코드를 보냈어요 💌');
  };

  return (
    <Screen>
      <Title>메일을 확인해 주세요 💌</Title>
      <Body soft>{email} 로 보낸 인증 코드를 입력해 주세요.</Body>
      <Field
        value={code}
        onChangeText={setCode}
        placeholder="인증 코드"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        maxLength={10}
      />
      <Button title="확인" onPress={verify} loading={loading} disabled={code.trim().length < 6} />
      <Button title="코드 다시 받기" variant="soft" onPress={resend} />
      <Button title="로그인으로 돌아가기" variant="ghost" onPress={() => router.replace('/login')} />
    </Screen>
  );
}
