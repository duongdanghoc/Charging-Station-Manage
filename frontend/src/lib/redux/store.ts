/**
 * Redux store configuration
 */
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./services/auth";
import { profileApi } from "./services/profileApi";
import { adminApi } from "./services/adminApi";
import authReducer from "./services/authSlice";
import { stationApi } from "./services/stationApi";
import { priceApi } from "./services/priceApi";
import { chargingPoleApi } from "./services/chargingPoleApi";
/**
 * Configure and export the Redux store
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [stationApi.reducerPath]: stationApi.reducer,
    [priceApi.reducerPath]: priceApi.reducer,
    [chargingPoleApi.reducerPath]: chargingPoleApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(profileApi.middleware)
      .concat(adminApi.middleware)
      .concat(stationApi.middleware)
      .concat(priceApi.middleware)
      .concat(chargingPoleApi.middleware),
});

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

// Infer the RootState and AppDispatch types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
