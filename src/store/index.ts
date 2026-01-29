import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './baseApi';
import { streamChatApi } from './streamChatApi';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [streamChatApi.reducerPath]: streamChatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, streamChatApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
