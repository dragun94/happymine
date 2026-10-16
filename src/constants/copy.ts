// 알림과 화면 문구. 말투는 다정한 친구처럼, 재촉하지 않게.
export const NotificationCopy = {
  title: '행복지뢰',
  pre: '30분 뒤에 작은 행복이 기다리고 있어요',
  preHidden: '30분 뒤, 뭔가 좋은 일이 생겨요',
  pop: (content: string) => `지금이에요! ${content}, 행복지뢰 펑 🎉`,
  popHidden: '지금이에요! 행복지뢰 펑 🎉 열어볼까요?',
} as const;

export const MoodEmojis = ['😊', '🥰', '😌', '🤩', '😋', '🥲', '😴', '🌈'] as const;
