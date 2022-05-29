import {
  configureStore,
  ThunkAction,
  Action,
  Dispatch,
} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import mintReducer from '../features/mint/mintSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    mint: mintReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export type AsyncThunkConfig<T = unknown> = {
  state: RootState;
  dispatch: Dispatch;
  rejectValue: T;
};
