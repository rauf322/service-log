import { configureStore } from "@reduxjs/toolkit";
import serviceFormReducer from "./features/serviceForm/index.ts";
import draftReducer from "./features/drafts/index.ts";

export const store = configureStore({
  reducer: {
    serviceForm: serviceFormReducer,
    drafts: draftReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
