import { z } from 'zod'

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no vàlida').nullable().optional()
const timeStr = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora no vàlida').nullable().optional()

// Base object — no refinements so .partial() can be called on it
const taskBaseObject = z.object({
  title:              z.string().min(1, 'El títol és obligatori').max(160, 'Màxim 160 caràcters'),
  description:        z.string().max(5000).nullable().optional(),
  dueDate:            dateStr,
  plannedDate:        dateStr,
  plannedTime:        timeStr,
  important:          z.boolean().nullable().optional(),
  urgent:             z.boolean().nullable().optional(),
  projectId:          z.number().nullable().optional(),
  categoryId:         z.number().nullable().optional(),
  recurring:          z.boolean().default(false),
  recurrenceType:     z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).nullable().optional(),
  recurrenceInterval: z.number().int().min(1).nullable().optional(),
  recurrenceEndDate:  dateStr,
  estimatedMinutes:   z.number().int().min(1).nullable().optional(),
  totalMinutes:       z.number().int().min(1).nullable().optional(),
})

export const taskCreateSchema = taskBaseObject
  .refine(
    (d) => !d.plannedTime || !!d.plannedDate,
    { message: 'L\'hora requereix una data planificada', path: ['plannedTime'] },
  )
  .refine(
    (d) => !d.recurring || !!d.recurrenceType,
    { message: 'Selecciona el tipus de recurrència', path: ['recurrenceType'] },
  )
  .refine(
    (d) => !d.recurring || (d.recurrenceInterval != null && d.recurrenceInterval >= 1),
    { message: 'L\'interval de recurrència ha de ser mínim 1', path: ['recurrenceInterval'] },
  )

// .partial() on the base object (no ZodEffects), then add update-relevant refinements
export const taskUpdateSchema = taskBaseObject
  .partial()
  .refine(
    (d) => !d.plannedTime || !!d.plannedDate,
    { message: 'L\'hora requereix una data planificada', path: ['plannedTime'] },
  )

export const categorySchema = z.object({
  name:  z.string().min(1, 'El nom és obligatori').max(80),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color no vàlid').default('#6366f1'),
})

export const projectSchema = z.object({
  name:  z.string().min(1, 'El nom és obligatori').max(80),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color no vàlid').default('#6366f1'),
})
