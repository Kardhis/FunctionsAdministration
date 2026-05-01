import { z } from 'zod'

export const habitSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
    description: z.string().trim().max(500).nullable().optional(),
    color: z
      .string()
      .regex(/^#([0-9a-fA-F]{6})$/, 'Color inválido (usa formato #RRGGBB)'),
    icon: z.string().trim().max(32).nullable().optional(),
    categoryIds: z.array(z.string().min(1)).default([]),
    active: z.boolean(),
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
    categoryIds: z.array(z.string().min(1)).optional(),
    active: z.boolean().optional(),
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
} catch (e) {
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
