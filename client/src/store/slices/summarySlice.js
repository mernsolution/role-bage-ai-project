import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utility/baseURL";

// ✅ Fetch summaries
export const fetchSummaries = createAsyncThunk(
  "summaries/fetchSummaries",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/summaries?userId=${userId}`);
      return res.data.summaries || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Delete summary
export const deleteSummary = createAsyncThunk(
  "summaries/deleteSummary",
  async (summaryId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/summaries/${summaryId}`);
      return summaryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const saveSummary = createAsyncThunk(
  "summaries/saveSummary",
  async (
    { newSummary, originalText, inputText, prompt, userId },
    { rejectWithValue }
  ) => {
    try {
      const saveData = {
        title: newSummary.title,
        content: newSummary.content,
        originalText: originalText || inputText,
        prompt: prompt,
        status: newSummary.status || "draft",
        fileName: newSummary.fileName || null,
        fileType: newSummary.fileType || "text",
        userId,
      };

      const res = await axiosInstance.post("/save-summaries", saveData);
      return res.data.summary;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const summarySlice = createSlice({
  name: "summaries",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchSummaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSummaries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSummaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // delete
      .addCase(deleteSummary.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (s) => s.id !== action.payload && s._id !== action.payload
        );
      })
      .addCase(deleteSummary.rejected, (state, action) => {
        state.error = action.payload;
      })

      // save
      .addCase(saveSummary.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // push the new summary to the top
      })
      .addCase(saveSummary.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default summarySlice.reducer;
