import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CATEGORY = ['game', 'web', 'entry', 'contest', 'etc'] as const;
const SUBCATEGORY = [
  'site-achievement', // 엔트리 사이트-내-성과
  'education',        // 엔트리 교육-성과
  'web-dev',          // 엔트리 웹-개발
  'highschool',       // 기타활동 고등학교
] as const;
const VARIANT = ['long', 'medium', 'short', 'empty'] as const;
const COVER_STYLE = ['mint', 'pink', 'mood', 'cream'] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    /* 식별 */
    title: z.string(),
    category: z.enum(CATEGORY),
    subcategory: z.enum(SUBCATEGORY).optional(),

    /* 시간 */
    year: z.union([z.number(), z.string()]).optional(),
    dateRange: z.string().optional(),

    /* 사람 */
    team: z.string().optional(),
    role: z.string().optional(),

    /* 분류 */
    tags: z.array(z.string()).default([]),

    /* 카드 표현 */
    cover: z.object({
      style: z.enum(COVER_STYLE).default('cream'),
      icon: z.string().optional(),
      label: z.string().optional(),
      badge: z.string().optional(),
      aspect: z.enum(['1', '4-5', '3-4', '4-3', '16-9', '16-10']).optional(),
      image: image().optional(),
    }).default({ style: 'cream' }),
    description: z.string(),
    featured: z.boolean().default(false),
    catLabel: z.string().optional(),

    /* 상세 페이지 표현 */
    variant: z.enum(VARIANT).optional(),
    icon_emoji: z.string().optional(),
    result: z.string().optional(),
    external_only: z.boolean().default(false),

    /* 외부 링크 */
    links: z.object({
      github: z.string().url().optional(),
      youtube: z.string().url().optional(),
      store: z.string().url().optional(),
      site: z.string().url().optional(),
      notion: z.string().url().optional(),
      naver: z.string().url().optional(),
      yes24: z.string().url().optional(),
      kyobo: z.string().url().optional(),
      others: z.array(z.object({
        label: z.string(),
        url: z.string().url(),
        kind: z.enum(['video', 'site', 'doc', 'other']).default('other'),
      })).default([]),
    }).default({ others: [] }),

    /* 정렬 */
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
