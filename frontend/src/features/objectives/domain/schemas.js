import { z } from 'zod'

export const objectiveMetricTypeSchema = z.enum(['REPETITIONS', 'MINUTES'])

export const objectiveCreateSchema = z
  .object({
    habitId: z.string().min(1, 'Selecciona un hábito'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
    notes: z.string().max(2000, 'Máximo 2000 caracteres').optional().or(z.literal('')),
    metricType: objectiveMetricTypeSchema,
    targetValue: z.number().int().positive('El objetivo debe ser > 0'),
  })
  .strict()

