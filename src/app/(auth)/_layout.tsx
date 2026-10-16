import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

// 로그아웃 상태로 앱을 열면 로그인 화면부터 보여줘요.
export const unstable_settings = {
  initialRouteName: 'login',
};

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="forgot" />
    </Stack>
  );
}
