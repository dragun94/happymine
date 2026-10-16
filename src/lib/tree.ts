import type { Mine } from './mines';

// 나무 한 그루는 완료한 지뢰 25개로 다 자라요.
export const PER_TREE = 25;

export const TreeStages = [
  { key: 'seed', min: 0, emoji: '🌰', name: '씨앗' },
  { key: 'sprout', min: 3, emoji: '🌱', name: '새싹' },
  { key: 'flower', min: 10, emoji: '🌸', name: '꽃' },
  { key: 'fruit', min: 25, emoji: '🍎', name: '열매' },
] as const;

export type TreeStage = (typeof TreeStages)[number];

export type TreeState = {
  /** 지금까지 완료한 지뢰 수 */
  total: number;
  /** 지금 키우는 나무에 들어간 수 (0~25) */
  progress: number;
  stage: TreeStage;
  next: TreeStage | null;
  /** '나의 숲'으로 옮겨진 나무들 (다 자란 날짜) */
  forest: { number: number; grownAt: string }[];
};

/**
 * 25번째 완료에서 열매가 맺히고, 26번째 완료부터 새 씨앗이 자라요.
 * 이때 열매 나무는 숲으로 옮겨져요.
 */
export function getTreeState(mines: Mine[]): TreeState {
  const completed = mines
    .filter((m) => m.completed_at)
    .map((m) => m.completed_at as string)
    .sort();
  const total = completed.length;
  const finished = total === 0 ? 0 : Math.floor((total - 1) / PER_TREE);
  const progress = total - finished * PER_TREE;

  let index = 0;
  TreeStages.forEach((s, i) => {
    if (progress >= s.min) index = i;
  });

  const forest = Array.from({ length: finished }, (_, i) => ({
    number: i + 1,
    grownAt: completed[(i + 1) * PER_TREE - 1],
  }));

  return {
    total,
    progress,
    stage: TreeStages[index],
    next: TreeStages[index + 1] ?? null,
    forest,
  };
}
