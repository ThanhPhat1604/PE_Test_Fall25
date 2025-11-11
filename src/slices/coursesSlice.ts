import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/apiClient';
import { StudySession } from '../types/student';

interface CoursesState {
  sessions: StudySession[];
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  sessions: [],
  loading: false,
  error: null,
};

// Helper: persist, wrapped in try/catch
const syncToStorage = async (sessions: StudySession[]) => {
  try {
    await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to sync sessions to storage', e);
  }
};

// fetchSessions: ensure each item has a stable unique id and normalized fields
export const fetchSessions = createAsyncThunk('courses/fetchSessions', async () => {
  try {
    const cached = await AsyncStorage.getItem('sessions');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed as StudySession[];
      } catch {
        // fall through to fetching remote
      }
    }

    const res = await api.get('/courses');
    const raw = res?.data ?? [];
    const normalized: StudySession[] = Array.isArray(raw)
      ? raw.map((item: any, idx: number) => ({
          id: (item && (item.id || item._id)) ? String(item.id ?? item._id) : `local-${Date.now()}-${idx}`,
          course: item?.course ?? item?.courseName ?? 'Unknown Course',
          duration: Number(item?.duration ?? item?.minutes ?? 0),
          date: item?.date ? new Date(item.date).toISOString() : new Date().toISOString(),
          completed: Boolean(item?.completed ?? false),
          notes: item?.notes ?? '',
        }))
      : [];

    await AsyncStorage.setItem('sessions', JSON.stringify(normalized));
    return normalized;
  } catch (err) {
    throw err;
  }
});

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    addSession: (state, action: PayloadAction<StudySession>) => {
      state.sessions.push(action.payload);
      // persist (fire-and-forget)
      syncToStorage(state.sessions);
    },
    updateSession: (state, action: PayloadAction<StudySession>) => {
      const index = state.sessions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = action.payload;
        syncToStorage(state.sessions);
      }
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
      syncToStorage(state.sessions);
    },
    setSessions: (state, action: PayloadAction<StudySession[]>) => {
      state.sessions = action.payload;
      syncToStorage(state.sessions);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSessions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload ?? [];
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message ?? 'Failed to fetch sessions';
      });
  },
});

export const { addSession, updateSession, deleteSession, setSessions } = coursesSlice.actions;
export default coursesSlice.reducer;
