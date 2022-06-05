import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import mintReducer from '../features/mint/mintSlice';
import tranferReducer from '../features/transfer/transferSlice';
import myGenerativeArtNFTReducer from '../features/myGenerativeArtNFT/myGenerativeArtNFTSlice';
import exhibitReducer from '../features/exhibit/exhibitSlice';
import childCanisterReducer from '../features/childCanister/childCanisterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    mint: mintReducer,
    transfer: tranferReducer,
    myGenerativeArtNFT: myGenerativeArtNFTReducer,
    exhibit: exhibitReducer,
    childCanister: childCanisterReducer,
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
  dispatch: AppDispatch;
  rejectValue: T;
};
