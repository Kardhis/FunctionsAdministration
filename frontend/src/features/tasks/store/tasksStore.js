import { create } from 'zustand'
import {
  listProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
} from '../data/taskProjectsRepo.js'
import {
  listCategories,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
} from '../data/taskCategoriesRepo.js'

/**
 * Global store for the Tasks module.
 * Manages shared data (projects, categories) loaded once per session.
 * Individual pages manage their own tasks/loading state locally.
 */
export const useTasksStore = create((set, get) => ({
  // Shared resources
  projects: [],
  categories: [],
  bootstrapped: false,
  bootstrapError: '',

  // Toast notifications
  toasts: [],

  async bootstrap() {
    if (get().bootstrapped) return
    try {
      const [projects, categories] = await Promise.all([listProjects(), listCategories()])
      set({
        projects: Array.isArray(projects) ? projects : [],
        categories: Array.isArray(categories) ? categories : [],
        bootstrapped: true,
        bootstrapError: '',
      })
    } catch (e) {
      set({ bootstrapError: e instanceof Error ? e.message : 'Error carregant dades' })
    }
  },

  resetSession() {
    set({ projects: [], categories: [], bootstrapped: false, bootstrapError: '', toasts: [] })
  },

  async refreshProjects() {
    try {
      const projects = await listProjects()
      set({ projects: Array.isArray(projects) ? projects : [] })
    } catch (_) {}
  },

  async refreshCategories() {
    try {
      const categories = await listCategories()
      set({ categories: Array.isArray(categories) ? categories : [] })
    } catch (_) {}
  },

  async createProject(data) {
    try {
      const created = await apiCreateProject(data)
      await get().refreshProjects()
      return { ok: true, project: created }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  async updateProject(id, data) {
    try {
      const updated = await apiUpdateProject(id, data)
      await get().refreshProjects()
      return { ok: true, project: updated }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  async deleteProject(id) {
    try {
      await apiDeleteProject(id)
      await get().refreshProjects()
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  async createCategory(data) {
    try {
      const created = await apiCreateCategory(data)
      await get().refreshCategories()
      return { ok: true, category: created }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  async updateCategory(id, data) {
    try {
      const updated = await apiUpdateCategory(id, data)
      await get().refreshCategories()
      return { ok: true, category: updated }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  async deleteCategory(id) {
    try {
      await apiDeleteCategory(id)
      await get().refreshCategories()
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  addToast(message, kind = 'success') {
    const id = crypto.randomUUID()
    set((s) => ({
      toasts: [...s.toasts, { id, message, kind, createdAt: Date.now() }],
    }))
    setTimeout(() => get().dismissToastById(id), 3000)
  },

  dismissToastById(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },

  dismissToast(idx) {
    set((s) => ({ toasts: s.toasts.filter((_, i) => i !== idx) }))
  },
}))
