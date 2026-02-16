import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** A command that can be executed from the palette. */
export interface PaletteCommand {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  action: () => void;
}

/** Command store state. */
interface CommandsState {
  recentIds: string[];
  addRecent: (id: string) => void;
}

/** Store for recently used commands, persisted to localStorage. */
export const useCommandsStore = create<CommandsState>()(
  persist(
    (set) => ({
      recentIds: [],
      addRecent: (id: string) =>
        set((state) => ({
          recentIds: [id, ...state.recentIds.filter((r) => r !== id)].slice(0, 10),
        })),
    }),
    { name: 'ditloop-commands' },
  ),
);
