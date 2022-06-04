import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

import { RootState, AsyncThunkConfig } from '../../app/store';
import { createNFTBarterActor } from '../../utils/createNFTBarterActor';
import {
  UserProfile,
  Result,
  Error,
} from '../../../../declarations/NFTBarter/NFTBarter.did';

export interface ChildCanisterState {
  error?: Error;
}

const initialState: ChildCanisterState = {};

export const create = createAsyncThunk<
  ChildCanisterState,
  undefined,
  AsyncThunkConfig<{ error: Error }>
>('childCanisterSlice/create', async (_, { rejectWithValue }) => {
  const authClient = await AuthClient.create();

  if (!authClient) {
    throw new Error('Failed to use auth client.');
  }

  return rejectWithValue({ error: { other: '' } });
});

export const childCanisterSlice = createSlice({
  name: 'childCanister',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(create.fulfilled, (state, action) => {});
    builder.addCase(create.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const selectError = (state: RootState) => state.childCanister.error;

export default childCanisterSlice.reducer;
