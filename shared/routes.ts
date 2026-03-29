import { z } from 'zod';
import { insertUserSchema, users, products, orders, addresses, insertAddressSchema, paymentStatusValues } from './schema';

const checkoutItemsSchema = z.array(z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().max(99),
  size: z.string().trim().min(1).max(100),
})).min(1).max(100);

const promoCodeSchema = z.string().trim().min(1).max(50);

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(1).max(50),
  street: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().max(50).optional(),
});

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
    updateProfile: {
      method: 'PATCH' as const,
      path: '/api/auth/profile' as const,
      input: z.object({
        firstName: z.string().min(1),
        lastName: z.string().optional(),
        email: z.string().email(),
        phone: z.string().min(1),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    changePassword: {
      method: 'POST' as const,
      path: '/api/auth/change-password' as const,
      input: z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      }),
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
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
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id' as const,
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: z.object({
        items: checkoutItemsSchema,
        shippingAddress: shippingAddressSchema,
        paymentMethod: z.enum(["card", "cod"]),
        promoCode: promoCodeSchema.optional(),
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  payments: {
    moyasar: {
      config: {
        method: 'GET' as const,
        path: '/api/payments/moyasar/config' as const,
        responses: {
          200: z.object({
            publishableKey: z.string(),
          }),
          503: errorSchemas.validation,
        }
      },
      create: {
        method: 'POST' as const,
        path: '/api/payments/moyasar/create' as const,
        input: z.object({
          items: checkoutItemsSchema,
          shippingAddress: shippingAddressSchema,
          promoCode: promoCodeSchema.optional(),
          token: z.string().min(1),
        }),
        responses: {
          200: z.object({
            checkoutSessionId: z.number(),
            paymentId: z.string(),
            paymentStatus: z.enum(paymentStatusValues),
            transactionUrl: z.string().url(),
          }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        }
      },
      verify: {
        method: 'POST' as const,
        path: '/api/payments/moyasar/verify' as const,
        input: z.object({
          checkoutSessionId: z.number().optional(),
          orderId: z.number().optional(),
          paymentId: z.string().min(1),
        }),
        responses: {
          200: z.object({
            checkoutSessionId: z.number().nullable(),
            orderId: z.number().nullable(),
            orderNo: z.string().nullable(),
            paymentId: z.string(),
            paymentStatus: z.enum(paymentStatusValues),
            moyasarStatus: z.string(),
          }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        }
      }
    }
  },
  promos: {
    apply: {
      method: "POST" as const,
      path: "/api/promos/apply" as const,
      input: z.object({
        items: checkoutItemsSchema,
        promoCode: promoCodeSchema,
      }),
      responses: {
        200: z.object({
          promoCode: z.string(),
          subtotal: z.number().int().nonnegative(),
          shipping: z.number().int().nonnegative(),
          discount: z.number().int().nonnegative(),
          total: z.number().int().nonnegative(),
        }),
        400: errorSchemas.validation,
      },
    },
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
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/addresses/:id' as const,
      input: insertAddressSchema.partial(),
      responses: {
        200: z.custom<typeof addresses.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
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
