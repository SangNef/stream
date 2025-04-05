import { configureStore } from "@reduxjs/toolkit";
import { getProfile } from "~/actions/AuthAction";
import authReducer from "~/reducers/AuthReducer";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

const token = localStorage.getItem("accessToken");
if (token) {
    store.dispatch(getProfile() as any);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
