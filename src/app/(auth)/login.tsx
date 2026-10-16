import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Field, Screen } from '@/components/ui';
import { AuthConfig } from '@/constants/config';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (!error) return; // 로그인되면 자동으로 홈으로 이동해요.

    if (AuthConfig.emailOtp && error.code === 'email_not_confirmed') {
      await supabase.auth.resend({ type: 'signup', email: email.trim() });
      router.push({ pathname: '/verify', params: { email: email.trim() } });
      return;
    }
    Alert.alert('로그인하지 못했어요', '이메일이나 비밀번호를 다시 확인해 주세요.');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.logo}>🎁</Text>
        <Text style={styles.title}>행복지뢰</Text>
        <Body soft>오늘 하루에 작은 행복을 심어볼까요?</Body>
      </View>
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
        placeholder="비밀번호"
        secureTextEntry
        autoComplete="password"
      />
      <Button title="로그인" onPress={login} loading={loading} disabled={!email || !password} />
      <View style={styles.links}>
        <Link href="/signup" style={styles.link}>
          처음이에요 (회원가입)
        </Link>
        {/* 비밀번호 재설정도 메일 코드가 필요해서, 코드 인증을 켰을 때만 보여줘요. */}
        {AuthConfig.emailOtp ? (
          <Link href="/forgot" style={styles.linkSoft}>
            비밀번호를 잊었어요
          </Link>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.sm, marginTop: 60, marginBottom: Spacing.lg },
  logo: { fontSize: 64 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.primary },
  links: { alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
  link: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '700' },
  linkSoft: { fontSize: FontSize.sm, color: Colors.textSoft },
});
