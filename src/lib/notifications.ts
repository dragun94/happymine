import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { NotificationCopy } from '@/constants/copy';
import { PRE_NOTICE_MS, type Mine } from './mines';

const CHANNEL_ID = 'mines';
// 아이폰은 예약 알림이 최대 64개라서 가까운 지뢰부터 이만큼만 예약해요 (지뢰 1개 = 알림 2개).
const MAX_MINES = 30;
// 웹 미리보기에서는 예약 알림을 쓸 수 없어서 알림 기능을 건너뛰어요.
const IS_WEB = Platform.OS === 'web';

// 앱이 켜져 있을 때도 알림을 보여줘요.
if (!IS_WEB) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: '행복지뢰 알림',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function getPermissionGranted() {
  if (IS_WEB) return false;
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/** 알림 권한을 요청해요. 이미 거절했다면 다시 묻지 않고 false 를 돌려줘요. */
export async function requestPermission() {
  if (IS_WEB) return false;
  await setupNotificationChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

function copyFor(mine: Mine) {
  // 하나라도 숨겼다면 알림에 내용을 쓰지 않아요.
  const hidden = mine.hide_content || mine.hide_time;
  return {
    pre: hidden ? NotificationCopy.preHidden : NotificationCopy.pre,
    pop: hidden ? NotificationCopy.popHidden : NotificationCopy.pop(mine.content),
  };
}

export async function scheduleMine(mine: Mine) {
  if (IS_WEB || mine.completed_at) return;
  const at = new Date(mine.scheduled_at).getTime();
  const now = Date.now();
  const copy = copyFor(mine);
  const data = { mineId: mine.id };

  if (at - PRE_NOTICE_MS > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${mine.id}-pre`,
      content: { title: NotificationCopy.title, body: copy.pre, data },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at - PRE_NOTICE_MS,
        channelId: CHANNEL_ID,
      },
    });
  }
  if (at > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${mine.id}-pop`,
      content: { title: NotificationCopy.title, body: copy.pop, data },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at,
        channelId: CHANNEL_ID,
      },
    });
  }
}

export async function cancelMine(mineId: string) {
  if (IS_WEB) return;
  await Notifications.cancelScheduledNotificationAsync(`${mineId}-pre`);
  await Notifications.cancelScheduledNotificationAsync(`${mineId}-pop`);
}

/** 서버의 지뢰 목록에 맞춰 폰의 예약 알림을 처음부터 다시 맞춰요. */
export async function syncNotifications(mines: Mine[]) {
  if (!(await getPermissionGranted())) return;
  await setupNotificationChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = Date.now();
  const upcoming = mines
    .filter((m) => !m.completed_at && new Date(m.scheduled_at).getTime() > now)
    .slice(0, MAX_MINES);
  for (const mine of upcoming) {
    await scheduleMine(mine);
  }
}

export async function cancelAll() {
  if (IS_WEB) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
