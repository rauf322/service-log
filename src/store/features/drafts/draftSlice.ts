import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Draft, ServiceLog } from "@/types/serviceLog";
import {
  saveDraftToDb,
  loadDraftsFromDb,
  deleteDraftFromDb,
  deleteAllDraftsFromDb,
} from "../../../utils/indexedDb";

export type DraftState = {
  drafts: Draft[];
  isLoading: boolean;
  error: string | null;
};

export const loadDraftsFromStorage = createAsyncThunk(
  "drafts/loadDraftsFromDb",
  async () => {
    return await loadDraftsFromDb();
  },
);

export const saveDraftToStorage = createAsyncThunk(
  "drafts/saveToStorage",
  async (payload: { title: string; formData: ServiceLog }) => {
    const now = new Date().toISOString();
    const draft: Draft = {
      id: crypto.randomUUID(),
      title: payload.title,
      data: payload.formData,
      createdAt: now,
      updatedAt: now,
    };
    await saveDraftToDb(draft);
    return draft;
  },
);

export const deleteDraftFromStorage = createAsyncThunk(
  "drafts/deleteDraftFromDb",
  async (draftId: string) => {
    await deleteDraftFromDb(draftId);
    return draftId;
  },
);

export const deleteAllDraftsFromStorage = createAsyncThunk(
  "drafts/deleteAllDraftsFromDb",
  async () => {
    await deleteAllDraftsFromDb();
    return;
  },
);

const initialState: DraftState = {
  drafts: [],
  isLoading: false,
  error: null,
};

export const draftSlice = createSlice({
  name: "drafts",
  initialState,
  reducers: {
    // Remove a draft by ID (sync only - for optimistic updates)
    deleteDraft: (state, action: PayloadAction<{ draftId: string }>) => {
      state.drafts = state.drafts.filter(
        (d: Draft) => d.id !== action.payload.draftId,
      );
    },

    // Clear all drafts (sync only - for optimistic updates)
    clearAllDrafts: (state) => {
      state.drafts = [];
    },

    // Loading states for async operations
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load drafts
      .addCase(loadDraftsFromStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadDraftsFromStorage.fulfilled, (state, action) => {
        state.drafts = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loadDraftsFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to load drafts";
      })

      // Save draft
      .addCase(saveDraftToStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveDraftToStorage.fulfilled, (state, action) => {
        state.drafts.push(action.payload);
        state.isLoading = false;
        state.error = null;
      })
      .addCase(saveDraftToStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to save draft";
      })

      // Delete single draft
      .addCase(deleteDraftFromStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDraftFromStorage.fulfilled, (state, action) => {
        state.drafts = state.drafts.filter((d) => d.id !== action.payload);
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteDraftFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to delete draft";
      })

      // Delete all drafts
      .addCase(deleteAllDraftsFromStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAllDraftsFromStorage.fulfilled, (state) => {
        state.drafts = [];
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteAllDraftsFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to delete all drafts";
      });
  },
});

export const { deleteDraft, clearAllDrafts, setLoading, setError } =
  draftSlice.actions;

export default draftSlice.reducer;
