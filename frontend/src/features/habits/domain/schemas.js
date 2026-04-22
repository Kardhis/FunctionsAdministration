import { z } from 'zod'

export const habitCategorySchema = z.enum(['salud', 'estudio', 'trabajo', 'ejercicio', 'ocio', 'otro'])

export const habitTargetPeriodSchema = z.enum(['day', 'week', 'month'])

export const habitTargetTypeSchema = z.enum(['minutes_per_day', 'sessions_per_week', 'hours_per_month'])

export const habitSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
    description: z.string().trim().max(500).nullable().optional(),
    color: z
      .string()
      .regex(/^#([0-9a-fA-F]{6})$/, 'Color inválido (usa formato #RRGGBB)'),
    icon: z.string().trim().max(32).nullable().optional(),
    category: habitCategorySchema.nullable().optional(),
    active: z.boolean(),
    targetType: habitTargetTypeSchema,
    targetValue: z.number().positive('El objetivo debe ser > 0'),
    targetPeriod: habitTargetPeriodSchema,
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()

export const habitCreateSchema = habitSchema.omit({ id: true, createdAt: true, updatedAt: true })

export const habitUpdateSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1, 'El nombre es obligatorio').max(80).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    color: z
      .string()
      .regex(/^#([0-9a-fA-F]{6})$/, 'Color inválido (usa formato #RRGGBB)')
      .optional(),
    icon: z.string().trim().max(32).nullable().optional(),
    category: habitCategorySchema.nullable().optional(),
    active: z.boolean().optional(),
    targetType: habitTargetTypeSchema.optional(),
    targetValue: z.number().positive('El objetivo debe ser > 0').optional(),
    targetPeriod: habitTargetPeriodSchema.optional(),
  })
  .strict()

const habitEntryBaseSchema = z
  .object({
    id: z.string().min(1),
    habitId: z.string().min(1, 'Selecciona un hábito'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora de inicio inválida (HH:mm)'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora de fin inválida (HH:mm)'),
    durationMinutes: z.number().int().nonnegative(),
    notes: z.string().trim().max(2000).nullable().optional(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()

export const habitEntrySchema = habitEntryBaseSchema.superRefine((val, ctx) => {
  const [sh, sm] = val.startTime.split(':').map(Number)
  const [eh, em] = val.endTime.split(':').map(Number)
  const start = sh * 60 + sm
  const end = eh * 60 + em
  if (end < start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La hora de fin no puede ser anterior a la hora de inicio',
      path: ['endTime'],
    })
  }
})

// #region agent log
fetch('http://127.0.0.1:7682/ingest/642c7c98-6081-45de-bcbd-80eda9ca897a', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Debug-Session-Id': '1da3e3',
  },
  body: JSON.stringify({
    sessionId: '1da3e3',
    runId: 'pre-fix',
    hypothesisId: 'H1',
    location: 'features/habits/domain/schemas.js:habitEntryCreateSchema',
    message: 'About to define habitEntryCreateSchema via omit on habitEntrySchema',
    data: {},
    timestamp: Date.now(),
  }),
}).catch(() => {})
// #endregion agent log

let habitEntryCreateSchemaTmp
try {
  habitEntryCreateSchemaTmp = habitEntryBaseSchema
    .omit({ id: true, createdAt: true, updatedAt: true, durationMinutes: true })
    .superRefine((val, ctx) => {
      const [sh, sm] = val.startTime.split(':').map(Number)
      const [eh, em] = val.endTime.split(':').map(Number)
      const start = sh * 60 + sm
      const end = eh * 60 + em
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La hora de fin no puede ser anterior a la hora de inicio',
          path: ['endTime'],
        })
      }
    })

  // #region agent log
  fetch('http://127.0.0.1:7682/ingest/642c7c98-6081-45de-bcbd-80eda9ca897a', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '1da3e3',
    },
    body: JSON.stringify({
      sessionId: '1da3e3',
      runId: 'post-fix',
      hypothesisId: 'H4',
      location: 'features/habits/domain/schemas.js:habitEntryCreateSchema',
      message: 'habitEntryCreateSchema defined successfully via baseSchema.omit().superRefine()',
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion agent log
} catch (e) {
  // #region agent log
  fetch('http://127.0.0.1:7682/ingest/642c7c98-6081-45de-bcbd-80eda9ca897a', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '1da3e3',
    },
    body: JSON.stringify({
      sessionId: '1da3e3',
      runId: 'post-fix',
      hypothesisId: 'H4',
      location: 'features/habits/domain/schemas.js:habitEntryCreateSchema',
      message: 'FAILED to define habitEntryCreateSchema',
      data: { error: e instanceof Error ? e.message : String(e) },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion agent log
  throw e
}

export const habitEntryCreateSchema = habitEntryCreateSchemaTmp

export const habitEntryUpdateSchema = z
  .object({
    id: z.string().min(1),
    habitId: z.string().min(1).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    if (val.startTime && val.endTime) {
      const [sh, sm] = val.startTime.split(':').map(Number)
      const [eh, em] = val.endTime.split(':').map(Number)
      const start = sh * 60 + sm
      const end = eh * 60 + em
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La hora de fin no puede ser anterior a la hora de inicio',
          path: ['endTime'],
        })
      }
    }
  })
