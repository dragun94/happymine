import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ko');

// 앱 전체를 한국 시간 기준으로 계산해요.
export const TZ = 'Asia/Seoul';

export function kst(date?: string | number | Date | Dayjs) {
  return dayjs(date).tz(TZ);
}

/** 'YYYY-MM-DD' 형식의 한국 날짜 */
export function kstDateKey(date?: string | number | Date | Dayjs) {
  return kst(date).format('YYYY-MM-DD');
}

/** 한국 날짜 + 시/분 → 실제 시각 */
export function kstAt(dateKey: string, hour: number, minute: number) {
  // hour 가 24 이면 다음 날 0시예요 (랜덤 범위 끝을 '24시'로 쓸 수 있게).
  return dayjs.tz(`${dateKey} 00:00`, TZ).add(hour, 'hour').add(minute, 'minute');
}

/** 시(hour)를 DB의 time 형식으로: 9 → '09:00' */
export function hourToTime(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

/** 0~24 시를 '오전 9시', '오후 9시', '밤 12시' 로 */
export function formatHour(hour: number) {
  if (hour === 0 || hour === 24) return '밤 12시';
  if (hour === 12) return '낮 12시';
  return hour < 12 ? `오전 ${hour}시` : `오후 ${hour - 12}시`;
}

/** DB의 time 값('10:00:00')에서 시(hour)만 꺼내요 */
export function hourOf(time: string) {
  return Number(time.slice(0, 2));
}

/**
 * 랜덤 시간 뽑기: 그날 startHour 시 ~ endHour 시 사이에서 1분 단위로 골라요.
 * 오늘이면 지금보다 1분 이후만 골라요. 고를 수 있는 시간이 없으면 null.
 */
export function pickRandomTime(dateKey: string, startHour: number, endHour: number) {
  let from = kstAt(dateKey, startHour, 0);
  const to = kstAt(dateKey, endHour, 0);
  const earliest = kst().add(1, 'minute').startOf('minute');
  if (from.isBefore(earliest)) from = earliest;
  const minutes = to.diff(from, 'minute');
  if (minutes <= 0) return null;
  return from.add(Math.floor(Math.random() * minutes), 'minute');
}

/** 남은 시간을 '12:34' 또는 '1:02:03' 처럼 보여줘요 */
export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** '3시간 12분' 처럼 대략적인 남은 시간 */
export function formatRemaining(ms: number) {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}일 ${h}시간`;
  if (h > 0) return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
  return `${m}분`;
}

/** '10월 16일 (목)' */
export function formatDay(date: string | Dayjs) {
  return kst(date).format('M월 D일 (dd)');
}

/** '오후 2:30' */
export function formatTime(date: string | Dayjs) {
  return kst(date).format('A h:mm');
}

export { dayjs };
