'use client'
import { create } from 'zustand'

export const useConfirmStore = create(set => ({
  isOpen: false,
  isLoading: false,
  config: null,
  confirm: config => set({ isOpen: true, config, isLoading: false }),
  close: () => set({ isOpen: false, isLoading: false }),
  setLoading: loading => set({ isLoading: loading })
}))
