import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from '../slices/coursesSlice';
import analyticsReducer from '../slices/analyticsSlice';
import plannerReducer from '../slices/plannerSlice';

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    analytics: analyticsReducer,
    planner: plannerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
