import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/slices';
import summaryReducer from './slices/summarySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
     summaries: summaryReducer,
  },
});
