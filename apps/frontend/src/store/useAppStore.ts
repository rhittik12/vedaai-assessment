import { create } from 'zustand';

export type Assignment = {
  id: string;
  title: string;
  fileName?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
};

type AppState = {
  // existing socket fields (preserved for compatibility)
  socketConnected: boolean;
  lastMessage: string;

  // requested fields
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  jobStatus: Record<string, 'pending' | 'processing' | 'completed' | 'failed'>;

  // actions
  setSocketConnected: (socketConnected: boolean) => void;
  setLastMessage: (lastMessage: string) => void;
  setAssignments: (items: Assignment[]) => void;
  addAssignment: (item: Assignment) => void;
  setCurrentAssignment: (item: Assignment | null) => void;
  updateJobStatus: (id: string, status: AppState['jobStatus'][string]) => void;
};

export const useAppStore = create<AppState>((set) => ({
  socketConnected: false,
  lastMessage: 'No messages yet.',

  assignments: [],
  currentAssignment: null,
  jobStatus: {},

  setSocketConnected: (socketConnected) => set({ socketConnected }),
  setLastMessage: (lastMessage) => set({ lastMessage }),

  setAssignments: (items) => set({ assignments: items }),
  addAssignment: (item) => set((s) => ({ assignments: [item, ...s.assignments] })),
  setCurrentAssignment: (item) => set({ currentAssignment: item }),
  updateJobStatus: (id, status) => set((s) => ({ jobStatus: { ...s.jobStatus, [id]: status } }))
}));

export default useAppStore;