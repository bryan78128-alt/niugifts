import { defineCollection, z } from 'astro:content';

const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  category: z.string(),
  features: z.array(z.string()).optional(),
  specs: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
  materials: z.array(z.string()).optional(),
  customization: z.array(z.string()).optional(),
  images: z.array(z.string()),
  coverImage: z.string(),
  template: z.enum(['image-center', 'image-left', 'image-right', 'image-only', 'slideshow']).default('image-only'),
  moq: z.string().optional(),
  priceRange: z.string().optional(),
  order: z.number().default(0),
  published: z.boolean().default(true),
});

const caseSchema = z.object({
  id: z.string(),
  title: z.string(),
  client: z.string(),
  description: z.string(),
  products: z.array(z.string()),
  images: z.array(z.string()),
  coverImage: z.string(),
  testimonial: z.string().optional(),
  testimonialAuthor: z.string().optional(),
  order: z.number().default(0),
  published: z.boolean().default(true),
});

export const collections = {
  products: defineCollection({ type: 'content', schema: productSchema }),
  products_en: defineCollection({ type: 'content', schema: productSchema }),
  cases: defineCollection({ type: 'content', schema: caseSchema }),
  cases_en: defineCollection({ type: 'content', schema: caseSchema }),
};
