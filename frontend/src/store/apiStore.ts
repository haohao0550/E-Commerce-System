import { create } from 'zustand'
import type { ApiResponse } from '@/types/api'
import { apiClient } from '@/services/api-client'

type State = {
  loadingCount: number
  lastError?: string | null
  lastResponse?: unknown
  isLoading: boolean
  callApi: <T = any>(path: string, options?: { method?: string; body?: unknown; auth?: boolean }) => Promise<ApiResponse<T>>
}

export const useApiStore = create<State>((set, get) => ({
  loadingCount: 0,
  lastError: null,
  lastResponse: undefined,
  get isLoading() {
    return get().loadingCount > 0
  },
  callApi: async <T = any>(path: string, options: { method?: string; body?: unknown; auth?: boolean } = {}) => {
    set((s) => ({ loadingCount: s.loadingCount + 1, lastError: null }))
    try {
      const res = await apiClient<T>(path, { method: options.method as any, body: options.body, auth: options.auth })
      set({ lastResponse: res.data })
      return res as ApiResponse<T>
    } catch (err: any) {
      set({ lastError: err.message || String(err) })
      throw err
    } finally {
      set((s) => ({ loadingCount: Math.max(0, s.loadingCount - 1) }))
    }
  }
}))

export default useApiStore
