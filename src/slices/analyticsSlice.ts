import { createSlice } from '@reduxjs/toolkit';
import { StudySession } from '../types/student';

interface AnalyticsState {
  weeklyMinutes: number[];
  completionByCourse: { [course: string]: number };
}

const initialState: AnalyticsState = { weeklyMinutes: [], completionByCourse: {} };

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    computeAnalytics: (state, action: { payload: StudySession[] }) => {
      const sessions = action.payload || [];
      const weekly = Array(7).fill(0);
      const byCourse: Record<string, { done: number; total: number }> = {};

      sessions.forEach(s => {
        const day = new Date(s.date).getDay();
        weekly[day] += s.duration || 0;
        if (!byCourse[s.course]) byCourse[s.course] = { done: 0, total: 0 };
        byCourse[s.course].total++;
        if (s.completed) byCourse[s.course].done++;
      });

      state.weeklyMinutes = weekly;
      state.completionByCourse = Object.keys(byCourse).reduce((acc, key) => {
        acc[key] = (byCourse[key].done / byCourse[key].total) * 100;
        return acc;
      }, {} as Record<string, number>);
    },
  },
});

export const { computeAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
