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
import { principalToAccountIdentifier } from '../../utils/ext';

export interface ExhibitState {
  error?: Error;
}

const initialState: ExhibitState = {};

export const exhibit = createAsyncThunk<
  ExhibitState,
  undefined,
  AsyncThunkConfig<{ error: Error }>
>('exhibit/implement', async (_, { rejectWithValue }) => {
  const authClient = await AuthClient.create();

  if (!authClient) {
    throw new Error('Failed to use auth client.');
  }

  return rejectWithValue({ error: { other: '' } });
});

export const exhibitSlice = createSlice({
  name: 'exhibit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(exhibit.fulfilled, (state, action) => {});
    builder.addCase(exhibit.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const selectError = (state: RootState) => state.exhibit.error;

export default exhibitSlice.reducer;
