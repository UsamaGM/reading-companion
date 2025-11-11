import { create } from "zustand";

interface UiState {
  isLoading: boolean;
  setLoading: (status: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isLoading: false,
  setLoading: (status) => set({ isLoading: status }),
}));
