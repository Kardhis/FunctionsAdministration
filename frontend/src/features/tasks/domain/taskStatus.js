export const TASK_STATUSES = [
  { value: 'BACKLOG',     label: 'Backlog',      tone: 'neutral' },
  { value: 'PENDIENTE',   label: 'Pendent',      tone: 'neutral' },
  { value: 'PLANIFICADA', label: 'Planificada',  tone: 'info'    },
  { value: 'EN_PROGRESO', label: 'En progrés',   tone: 'warning' },
  { value: 'BLOQUEADA',   label: 'Blocada',      tone: 'danger'  },
  { value: 'COMPLETADA',  label: 'Completada',   tone: 'success' },
  { value: 'CANCELADA',   label: 'Cancel·lada',  tone: 'neutral' },
]

export const FINAL_STATUSES = new Set(['COMPLETADA', 'CANCELADA'])

/** @param {string} status */
export function getStatusMeta(status) {
  return TASK_STATUSES.find((s) => s.value === status) ?? { value: status, label: status, tone: 'neutral' }
}

/** @param {string} status */
export function isFinal(status) {
  return FINAL_STATUSES.has(status)
}

/** @param {object} task */
export function isOverdue(task) {
  if (!task.dueDate || FINAL_STATUSES.has(task.status)) return false
  return new Date(task.dueDate) < new Date(new Date().toDateString())
}

export const RECURRENCE_TYPES = [
  { value: 'DAILY',   label: 'Cada dia'     },
  { value: 'WEEKLY',  label: 'Cada setmana' },
  { value: 'MONTHLY', label: 'Cada mes'     },
]

export const EISENHOWER_QUADRANTS = [
  { key: 'importantUrgent',      important: true,  urgent: true,  label: 'IMPORTANT I URGENT',         description: 'Fes-ho ara'   },
  { key: 'importantNotUrgent',   important: true,  urgent: false, label: 'IMPORTANT I NO URGENT',      description: 'Planifica-ho' },
  { key: 'notImportantUrgent',   important: false, urgent: true,  label: 'NO IMPORTANT, PERÒ URGENT',  description: 'Delega-ho'    },
  { key: 'notImportantNotUrgent',important: false, urgent: false, label: 'NO IMPORTANT I NO URGENT',   description: 'Elimina-ho'   },
]
