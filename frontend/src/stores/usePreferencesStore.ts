import { create } from "zustand";

interface PreferencesState {
  soundEnabled: boolean;
  devToolsOpen: boolean;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleDevTools: () => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  soundEnabled: true,
  devToolsOpen: false,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),
  toggleDevTools: () => set((state) => ({ devToolsOpen: !state.devToolsOpen })),
}));
