import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utility/baseURL";

// Async thunks
export const checkSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/check-session");
      return data.authenticated && data.user
        ? {
            id: data.user.id,
            name: data.user.name || data.user.userName,
            email: data.user.email,
            role: data.user.role,
            credits: data.user.credits || 100,
            createdAt: data.user.createdAt,
          }
        : rejectWithValue("Not authenticated");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await axiosInstance.post("/logout");
});

export const loginUser = createAsyncThunk(
  "auth/sign-in",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/sign-in", credentials);

      const user = data.user || data.data || data;

      if (user && (user.id || user._id)) {
        return {
          id: user.id || user._id,
          name: user.name || user.userName || user.username,
          email: user.email,
          role: user.role,
          credits: user.credits || 100,
          createdAt: user.createdAt,
        };
      }

      // If no user data found, log the response and reject
      console.error("No user data found in response:", data);
      return rejectWithValue("Login failed - no user data");
    } catch (error) {
      console.error("Login error:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  },
  reducers: {
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkSession.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { updateUser, clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
