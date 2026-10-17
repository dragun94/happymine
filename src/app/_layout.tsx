import { focusManager, QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { Colors } from '@/constants/theme';
import { Keys } from '@/hooks/queries';
import { fetchMines } from '@/lib/mines';
import { syncNotifications } from '@/lib/notifications';
import '@/lib/web-alert';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

// 앱이 다시 화면에 나타나면 서버 데이터를 새로 받아와요.
AppState.addEventListener('change', (state) => focusManager.setFocused(state === 'active'));

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="mine/[id]"
            options={{
              headerShown: true,
              title: '',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: Colors.background },
              headerTintColor: Colors.primary,
              headerBackTitle: '뒤로',
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      {session ? <SignedInEffects /> : null}
    </>
  );
}

/** 로그인 상태일 때만 동작: 알림 다시 맞추기 + 알림 탭하면 지뢰 화면 열기 */
function SignedInEffects() {
  const client = useQueryClient();

  // 앱을 켤 때와 다시 화면으로 돌아올 때 서버 기준으로 알림을 맞춰요.
  useEffect(() => {
    const sync = async () => {
      try {
        const mines = await client.fetchQuery({ queryKey: Keys.mines, queryFn: fetchMines });
        await syncNotifications(mines);
      } catch {
        // 인터넷이 없으면 다음 기회에 다시 맞춰요.
      }
    };
    sync();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => sub.remove();
  }, [client]);

  // 웹 미리보기에는 알림이 없어요.
  return Platform.OS === 'web' ? null : <NotificationTapHandler />;
}

function NotificationTapHandler() {
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (lastResponse?.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const mineId = lastResponse.notification.request.content.data?.mineId;
    if (typeof mineId === 'string') {
      router.push({ pathname: '/mine/[id]', params: { id: mineId } });
      Notifications.clearLastNotificationResponseAsync();
    }
  }, [lastResponse]);

  return null;
}
