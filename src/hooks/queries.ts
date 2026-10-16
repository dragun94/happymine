import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  completeMine,
  deleteMine,
  fetchMines,
  fetchProfile,
  fetchSuggestions,
  insertMine,
  updateMood,
  updateProfile,
  type Mine,
  type NewMine,
} from '@/lib/mines';
import { cancelMine, scheduleMine } from '@/lib/notifications';

export const Keys = {
  mines: ['mines'] as const,
  profile: ['profile'] as const,
  suggestions: ['suggestions'] as const,
};

export function useMines() {
  return useQuery({ queryKey: Keys.mines, queryFn: fetchMines });
}

export function useMine(id: string | undefined) {
  const query = useMines();
  return { ...query, mine: query.data?.find((m) => m.id === id) };
}

export function useProfile() {
  return useQuery({ queryKey: Keys.profile, queryFn: fetchProfile });
}

export function useSuggestions() {
  return useQuery({ queryKey: Keys.suggestions, queryFn: fetchSuggestions, staleTime: 60 * 60 * 1000 });
}

/** 받은 지뢰로 목록 캐시를 바로 고쳐서 화면이 즉시 바뀌게 해요 */
function useReplaceMine() {
  const client = useQueryClient();
  return (mine: Mine) =>
    client.setQueryData<Mine[]>(Keys.mines, (old) =>
      old?.map((m) => (m.id === mine.id ? mine : m)),
    );
}

export function usePlantMine() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (values: NewMine) => {
      const mine = await insertMine(values);
      await scheduleMine(mine).catch(() => {});
      return mine;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: Keys.mines }),
  });
}

export function useDeleteMine() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteMine(id);
      await cancelMine(id).catch(() => {});
    },
    onSuccess: () => client.invalidateQueries({ queryKey: Keys.mines }),
  });
}

type Mood = { mood_emoji: string | null; mood_note: string | null };

export function useCompleteMine() {
  const replace = useReplaceMine();
  return useMutation({
    mutationFn: ({ id, mood }: { id: string; mood: Mood }) => completeMine(id, mood),
    onSuccess: replace,
  });
}

export function useUpdateMood() {
  const replace = useReplaceMine();
  return useMutation({
    mutationFn: ({ id, mood }: { id: string; mood: Mood }) => updateMood(id, mood),
    onSuccess: replace,
  });
}

export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => client.setQueryData(Keys.profile, profile),
  });
}
