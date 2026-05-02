export const CATEGORY_LABEL = {
  game:    { ko: '게임 개발',   short: 'Game',    icon: 'G', emoji: '🎮' },
  web:     { ko: '웹 개발',     short: 'Web',     icon: 'W', emoji: '🕸' },
  entry:   { ko: '엔트리 활동', short: 'Entry',   icon: 'E', emoji: '🟧' },
  contest: { ko: '공모전 활동', short: 'Contest', icon: 'C', emoji: '🏆' },
  etc:     { ko: '기타 활동',   short: 'Etc',     icon: 'M', emoji: '🎸' },
} as const;

export type CategoryKey = keyof typeof CATEGORY_LABEL;
export const CATEGORY_KEYS = Object.keys(CATEGORY_LABEL) as CategoryKey[];

export const SUBCATEGORY_LABEL = {
  'site-achievement': '사이트 내 성과',
  'education':        '교육 성과',
  'web-dev':          '웹 개발',
  'highschool':       '고등학교',
} as const;
