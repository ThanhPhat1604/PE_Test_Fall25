import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlannedSession {
  id: string;
  course: string;
  date: string; // ISO
  reminderEnabled: boolean;
  notificationId?: string;
}

interface PlannerState {
  planned: PlannedSession[];
}

const initialState: PlannerState = { planned: [] };

const plannerSlice = createSlice({
  name: 'planner',
  initialState,
  reducers: {
    setPlanned: (state, action: PayloadAction<PlannedSession[]>) => {
      state.planned = action.payload;
      AsyncStorage.setItem('planned', JSON.stringify(state.planned));
    },
    toggleReminder: (state, action: PayloadAction<string>) => {
      const item = state.planned.find(p => p.id === action.payload);
      if (item) item.reminderEnabled = !item.reminderEnabled;
      AsyncStorage.setItem('planned', JSON.stringify(state.planned));
    },
    addPlanned: (state, action: PayloadAction<PlannedSession>) => {
      state.planned.push(action.payload);
      AsyncStorage.setItem('planned', JSON.stringify(state.planned));
    },
  },
});

export const { setPlanned, toggleReminder, addPlanned } = plannerSlice.actions;
export default plannerSlice.reducer;
