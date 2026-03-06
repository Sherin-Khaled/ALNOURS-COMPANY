import { z } from 'zod';
import { insertUserSchema, users, products, orders, addresses, insertAddressSchema } from './schema';

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
  })
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ email: z.string().email(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    signup: {
      method: 'POST' as const,
      path: '/api/auth/signup' as const,
      input: z.object({
        firstName: z.string().min(1),
        lastName: z.string().optional(),
        phone: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      }
    },
    forgotPassword: {
      method: 'POST' as const,
      path: '/api/auth/forgot-password' as const,
      input: z.object({ email: z.string().email() }),
      responses: {
        200: z.object({ message: z.string() }),
      }
    },
    resetPassword: {
      method: 'POST' as const,
      path: '/api/auth/reset-password' as const,
      input: z.object({
        token: z.string().min(1),
        password: z.string().min(6),
      }),
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      }
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:slug' as const,
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
        401: errorSchemas.unauthorized,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: z.object({
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          size: z.string()
        })),
        shippingAddress: z.object({
          fullName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
          street: z.string().min(1),
          city: z.string().min(1),
          country: z.string().min(1),
          postalCode: z.string().optional(),
        }),
        paymentMethod: z.enum(["card", "cod"]),
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  addresses: {
    list: {
      method: 'GET' as const,
      path: '/api/addresses' as const,
      responses: {
        200: z.array(z.custom<typeof addresses.$inferSelect>()),
        401: errorSchemas.unauthorized,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/addresses' as const,
      input: insertAddressSchema,
      responses: {
        201: z.custom<typeof addresses.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  contact: {
    submit: {
      method: 'POST' as const,
      path: '/api/contact' as const,
      input: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        productInterest: z.string().optional(),
        message: z.string().min(1),
      }),
      responses: {
        200: z.object({ message: z.string() }),
        500: errorSchemas.validation,
      }
    }
  }
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
