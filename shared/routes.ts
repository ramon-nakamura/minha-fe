import { z } from 'zod';
import { insertMessageSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const messageResponseSchema = z.object({
  id: z.number(),
  type: z.string(),
  content: z.string(),
  authorId: z.string().nullable(),
  likesCount: z.number(),
  isPardoned: z.boolean(),
  isSpecial: z.boolean(),
  createdAt: z.string().or(z.date()),
  authorName: z.string().optional(),
});

export const api = {
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/messages' as const,
      input: z.object({
        type: z.enum(['prayer', 'grace', 'sin']).optional()
      }).optional(),
      responses: {
        200: z.array(messageResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/messages' as const,
      input: insertMessageSchema.extend({
        isSpecial: z.boolean().optional(),
      }),
      responses: {
        201: messageResponseSchema,
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    like: {
      method: 'POST' as const,
      path: '/api/messages/:id/like' as const,
      responses: {
        200: messageResponseSchema,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    pardon: {
      method: 'POST' as const,
      path: '/api/messages/:id/pardon' as const,
      responses: {
        200: messageResponseSchema,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/messages/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    deleteBulk: {
      method: 'POST' as const,
      path: '/api/messages/delete-bulk' as const,
      input: z.object({
        ids: z.array(z.number()),
      }),
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type CreateMessageInput = z.infer<typeof api.messages.create.input>;
