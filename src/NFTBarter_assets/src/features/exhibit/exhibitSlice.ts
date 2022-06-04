import { createSlice, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';

import { RootState, AsyncThunkConfig } from '../../app/store';
import {
  getChildCanisters,
  createChildCanister,
} from '../childCanister/childCanisterSlice';

import {
  CanisterID,
  Error,
} from '../../../../declarations/NFTBarter/NFTBarter.did';

export interface ExhibitState {
  childCanisterId?: string;
  error?: Error;
}

const initialState: ExhibitState = {};

export const exhibit = createAsyncThunk<
  ExhibitState,
  undefined,
  AsyncThunkConfig<{ error: Error }>
>('exhibit', async (_, { rejectWithValue, dispatch }) => {
  const authClient = await AuthClient.create();

  if (!authClient) {
    throw new Error('Failed to use auth client.');
  }

  // Get user's child canister IDs.
  let childCanisterIds: string[];
  try {
    const action = await dispatch(getChildCanisters());
    const state = unwrapResult(action);
    childCanisterIds = state.canisterIds;
  } catch (rejectedValueOrSerializedError) {
    return rejectWithValue({
      error: { other: 'Error occured during fetching child canisters.' },
    });
  }

  // If user does not have any child canister yet, create one.
  let childCanisterId: string;
  if (childCanisterIds.length === 0) {
    try {
      const action = await dispatch(createChildCanister());
      const state = unwrapResult(action);
      childCanisterId = state.canisterIds[0];
    } catch (rejectedValueOrSerializedError) {
      return rejectWithValue({
        error: { other: 'Error occured during creating child canisters.' },
      });
    }
  } else {
    // So far, we use a child canister at 0-th index.
    // However, user may have more than one child canister in future.
    // We will implement some logic to chose which child canister should be used.
    childCanisterId = childCanisterIds[0];
  }
  console.log(childCanisterId);

  return { childCanisterId };
});

export const exhibitSlice = createSlice({
  name: 'exhibit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(exhibit.fulfilled, (state, action) => {
      state.childCanisterId = action.payload?.childCanisterId;
    });
    builder.addCase(exhibit.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const selectChildCanisterId = (state: RootState) =>
  state.exhibit.childCanisterId;
export const selectError = (state: RootState) => state.exhibit.error;

export default exhibitSlice.reducer;
