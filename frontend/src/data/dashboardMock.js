/** @type {import('./types.js').Metric[]} */
export const dashboardMetrics = [
  { key: 'active_habits', label: 'Hábitos activos', value: 6, delta: { value: 12, period: 'month' } },
  { key: 'today_done', label: 'Completados hoy', value: 3, delta: { value: 8, period: 'week' } },
  { key: 'streak', label: 'Streak actual', value: '9 días' },
  { key: 'weekly_rate', label: 'Adherencia semanal', value: '82%', delta: { value: 5, period: 'week' } },
]

/** @type {import('./types.js').Module[]} */
export const dashboardModules = [
  {
    key: 'habits',
    title: 'Gestión de hábitos',
    description: 'Crea, organiza y ajusta tus hábitos con objetivos claros.',
    primaryCta: { label: 'Ver hábitos', to: '/dashboard/habits/overview' },
  },
  {
    key: 'daily',
    title: 'Registro diario',
    description: 'Marca completados, añade notas y registra tu día en segundos.',
    primaryCta: { label: 'Registrar hoy', to: '/dashboard/daily' },
  },
  {
    key: 'stats',
    title: 'Estadísticas',
    description: 'Métricas y tendencias para entender tu progreso.',
    statusBadge: 'beta',
    primaryCta: { label: 'Abrir estadísticas', to: '/dashboard/stats' },
  },
  {
    key: 'calendar',
    title: 'Calendario',
    description: 'Vista temporal: consistencia, patrones y días clave.',
    primaryCta: { label: 'Abrir calendario', to: '/dashboard/calendar' },
  },
  {
    key: 'profile',
    title: 'Perfil de usuario',
    description: 'Gestiona tu cuenta, preferencias y seguridad.',
    primaryCta: { label: 'Ir a perfil', to: '/dashboard/profile' },
  },
]

/** @type {import('./types.js').QuickAction[]} */
export const dashboardQuickActions = [
  { key: 'new_habit', label: 'Añadir hábito', to: '/dashboard/habits/manage', variant: 'primary' },
  { key: 'log_today', label: 'Registrar hoy', to: '/dashboard/daily', variant: 'secondary' },
  { key: 'open_calendar', label: 'Ver calendario', to: '/dashboard/calendar', variant: 'secondary' },
  { key: 'edit_profile', label: 'Editar perfil', to: '/dashboard/profile', variant: 'secondary' },
]

/** @type {import('./types.js').ActivityEvent[]} */
export const dashboardRecentActivity = [
  {
    id: 'evt_1',
    type: 'login',
    title: 'Sesión iniciada correctamente',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'evt_2',
    type: 'habit_completed',
    title: 'Marcaste “Leer 15 min” como completado',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    meta: { habit: 'Leer 15 min' },
  },
  {
    id: 'evt_3',
    type: 'habit_created',
    title: 'Creaste el hábito “Caminar”',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    meta: { habit: 'Caminar' },
  },
  {
    id: 'evt_4',
    type: 'note_added',
    title: 'Añadiste una nota al registro diario',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

/** @type {import('./types.js').NavItem[]} */
export const dashboardNav = [
  { key: 'overview', label: 'Overview', to: '/dashboard', icon: 'grid' },
  {
    key: 'habits',
    label: 'Hàbits',
    icon: 'spark',
    children: [
      { key: 'habits-dashboard', label: 'Dashboard', to: '/dashboard/habits/overview' },
      { key: 'habits-objectives', label: 'Objetivos', to: '/dashboard/habits/objectives' },
      { key: 'habits-manage', label: 'Hábitos', to: '/dashboard/habits/manage' },
      { key: 'habits-log', label: 'Registros', to: '/dashboard/habits/log' },
      { key: 'habits-week', label: 'Semana', to: '/dashboard/habits/week' },
      { key: 'habits-analytics', label: 'Analítica', to: '/dashboard/habits/analytics' },
      { key: 'habits-settings', label: 'Ajustes', to: '/dashboard/habits/settings' },
    ],
  },
  { key: 'daily', label: 'Registro', to: '/dashboard/daily', icon: 'check' },
  { key: 'stats', label: 'Estadísticas', to: '/dashboard/stats', icon: 'chart' },
  { key: 'calendar', label: 'Calendario', to: '/dashboard/calendar', icon: 'calendar' },
  { key: 'profile', label: 'Perfil', to: '/dashboard/profile', icon: 'user' },
  {
    key: 'admin',
    label: 'Administració',
    icon: 'shield',
    requiresAdmin: true,
    children: [{ key: 'admin-users', label: 'Usuaris', to: '/dashboard/admin/users' }],
  },
]

