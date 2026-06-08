/** @param {object} values Form values from TaskFormModal */
export function buildTaskUpdatePayload(values) {
  const hasPlannedDate = Boolean(values.plannedDate)
  const hasPlannedTime = Boolean(values.plannedTime)

  return {
    title:                 values.title?.trim(),
    description:           values.description || null,
    dueDate:               values.dueDate || null,
    plannedDate:           hasPlannedDate ? values.plannedDate : null,
    plannedTime:           hasPlannedTime ? values.plannedTime : null,
    clearPlannedDate:      !hasPlannedDate ? true : undefined,
    clearPlannedTime:      hasPlannedDate && !hasPlannedTime ? true : undefined,
    important:             values.important ?? null,
    clearImportant:        values.important == null ? true : undefined,
    urgent:                values.urgent ?? null,
    clearUrgent:           values.urgent == null ? true : undefined,
    projectId:             values.projectId || null,
    categoryId:            values.categoryId || null,
    recurring:             values.recurring ?? false,
    recurrenceType:        values.recurring ? (values.recurrenceType || null) : null,
    recurrenceInterval:    values.recurring ? (values.recurrenceInterval ?? null) : null,
    recurrenceEndDate:     values.recurring ? (values.recurrenceEndDate || null) : null,
    estimatedMinutes:      values.estimatedMinutes ?? null,
    clearEstimatedMinutes: values.estimatedMinutes == null ? true : undefined,
    totalMinutes:          values.totalMinutes ?? null,
    clearTotalMinutes:     values.totalMinutes == null ? true : undefined,
  }
}
