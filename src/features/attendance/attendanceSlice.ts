import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AttendanceState, AttendanceRecord } from '@/types';
import { dummyAttendance } from '@/data/dummyData';
import { generateId } from '@/utils/helpers';

const initialState: AttendanceState = {
  records: dummyAttendance,
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    addAttendanceRecords: (
      state,
      action: PayloadAction<Omit<AttendanceRecord, 'id' | 'createdAt'>[]>
    ) => {
      const today = new Date().toISOString().split('T')[0];
      const newRecords: AttendanceRecord[] = action.payload.map(record => ({
        ...record,
        id: generateId(),
        createdAt: today,
      }));
      state.records.push(...newRecords);
    },
    updateAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      const index = state.records.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
    deleteAttendanceRecord: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter(r => r.id !== action.payload);
    },
  },
});

export const { addAttendanceRecords, updateAttendanceRecord, deleteAttendanceRecord } =
  attendanceSlice.actions;
export default attendanceSlice.reducer;
