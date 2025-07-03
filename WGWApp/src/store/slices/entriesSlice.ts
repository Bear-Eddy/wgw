import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { DailyEntry } from "../../types";
import { SupabaseService } from "../../services/supabase";

interface EntriesState {
  entries: DailyEntry[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EntriesState = {
  entries: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const createEntry = createAsyncThunk(
  "entries/createEntry",
  async (entry: {
    user_id: string;
    category: string;
    audioUri: string;
    transcription?: string;
    ai_response?: string;
  }) => {
    console.log("🚀 Redux createEntry called with:", entry);

    const result = await SupabaseService.createEntry(entry);

    console.log("✅ Redux createEntry result:", result);
    return result;
  }
);

export const fetchUserEntries = createAsyncThunk(
  "entries/fetchUserEntries",
  async (userId: string) => {
    const entries = await SupabaseService.getUserEntries(userId);
    return entries;
  }
);

const entriesSlice = createSlice({
  name: "entries",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addLocalEntry: (state, action: PayloadAction<DailyEntry>) => {
      state.entries.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Entry
      .addCase(createEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries.unshift(action.payload);
      })
      .addCase(createEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to create entry";
      })
      // Fetch User Entries
      .addCase(fetchUserEntries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload;
      })
      .addCase(fetchUserEntries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch entries";
      });
  },
});

export const { clearError, addLocalEntry } = entriesSlice.actions;
export default entriesSlice.reducer;
