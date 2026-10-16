import { supabase } from './supabase';

export type Mine = {
  id: string;
  user_id: string;
  content: string;
  suggestion_id: number | null;
  scheduled_at: string;
  time_mode: 'manual' | 'random';
  hide_time: boolean;
  hide_content: boolean;
  completed_at: string | null;
  mood_emoji: string | null;
  mood_note: string | null;
  created_at: string;
};

export type Suggestion = {
  id: number;
  title: string;
  emoji: string | null;
  description: string | null;
};

export type Profile = {
  id: string;
  nickname: string | null;
  random_start: string;
  random_end: string;
};

export type NewMine = Pick<
  Mine,
  'content' | 'suggestion_id' | 'scheduled_at' | 'time_mode' | 'hide_time' | 'hide_content'
>;

export const PRE_NOTICE_MS = 30 * 60 * 1000;

// ---------- 지뢰 상태 ----------
// waiting: 30분 전보다 이전 / soon: 30분 이내 / popped: 터짐(미완료) / done: 완료
export type Phase = 'waiting' | 'soon' | 'popped' | 'done';

export function phaseOf(mine: Mine, now: number): Phase {
  if (mine.completed_at) return 'done';
  const at = new Date(mine.scheduled_at).getTime();
  if (now >= at) return 'popped';
  if (now >= at - PRE_NOTICE_MS) return 'soon';
  return 'waiting';
}

/** 시간 숨김이어도 30분 전부터는 시간이 드러나요 */
export function isTimeVisible(mine: Mine, now: number) {
  return !mine.hide_time || phaseOf(mine, now) !== 'waiting';
}

/** 내용 숨김은 터지는 순간 공개돼요 */
export function isContentVisible(mine: Mine, now: number) {
  const phase = phaseOf(mine, now);
  return !mine.hide_content || phase === 'popped' || phase === 'done';
}

/** 시간이 보이는 지뢰를 먼저 시간순으로, 숨겨진 지뢰는 뒤에 (순서로 시간이 드러나지 않게) */
export function sortForDisplay(list: Mine[], now: number) {
  const visible = list.filter((m) => isTimeVisible(m, now));
  const hidden = list.filter((m) => !isTimeVisible(m, now));
  return [...visible, ...hidden];
}

/** 목록에서 무작위로 하나 (깜짝 추천) */
export function pickOne<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

// ---------- 서버 요청 ----------
export async function fetchMines() {
  const { data, error } = await supabase
    .from('mines')
    .select('*')
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data as Mine[];
}

export async function insertMine(mine: NewMine) {
  const { data, error } = await supabase.from('mines').insert(mine).select().single();
  if (error) throw error;
  return data as Mine;
}

export async function deleteMine(id: string) {
  const { error } = await supabase.from('mines').delete().eq('id', id);
  if (error) throw error;
}

export async function completeMine(id: string, mood: { mood_emoji: string | null; mood_note: string | null }) {
  const { data, error } = await supabase
    .from('mines')
    .update({ completed_at: new Date().toISOString(), ...mood })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Mine;
}

export async function updateMood(id: string, mood: { mood_emoji: string | null; mood_note: string | null }) {
  const { data, error } = await supabase.from('mines').update(mood).eq('id', id).select().single();
  if (error) throw error;
  return data as Mine;
}

export async function fetchSuggestions() {
  const { data, error } = await supabase
    .from('mission_suggestions')
    .select('id, title, emoji, description')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data as Suggestion[];
}

export async function fetchProfile() {
  const { data, error } = await supabase.from('profiles').select('*').single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(values: Partial<Pick<Profile, 'nickname' | 'random_start' | 'random_end'>>) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('로그인이 필요해요');
  const { data, error } = await supabase
    .from('profiles')
    .update(values)
    .eq('id', auth.user.id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}
