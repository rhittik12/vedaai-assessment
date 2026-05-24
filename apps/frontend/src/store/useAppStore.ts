import { create } from 'zustand';

type AppState = {
  socketConnected: boolean;
  lastMessage: string;
  setSocketConnected: (socketConnected: boolean) => void;
  setLastMessage: (lastMessage: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  socketConnected: false,
  lastMessage: 'No messages yet.',
  setSocketConnected: (socketConnected) => set({ socketConnected }),
  setLastMessage: (lastMessage) => set({ lastMessage })
}));