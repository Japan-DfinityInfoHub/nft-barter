import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

import { RootState, AsyncThunkConfig } from '../../app/store';
import { createNFTBarterActor } from '../../utils/createNFTBarterActor';
import { Error } from '../../../../declarations/NFTBarter/NFTBarter.did';

export interface ChildCanisterState {
  canisterIds: Principal[];
  error?: Error;
}

const initialState: ChildCanisterState = {
  canisterIds: [],
};

export const getChildCanisters = createAsyncThunk<
  ChildCanisterState,
  undefined,
  AsyncThunkConfig<{ error: Error }>
>('childCanister/get', async (_, { rejectWithValue }) => {
  const authClient = await AuthClient.create();

  if (!authClient || !authClient.isAuthenticated()) {
    return rejectWithValue({
      error: { unauthorized: 'Failed to use auth client.' },
    });
  }

  const identity = await authClient.getIdentity();
  const actor = createNFTBarterActor({
    agentOptions: { identity },
  });

  const res = await actor.getMyChildCanisters();
  if ('ok' in res) {
    const canisterIds = res.ok;
    return {
      canisterIds,
    };
  } else {
    return rejectWithValue({
      error: res.err,
    });
  }
});

export const createChildCanister = createAsyncThunk<
  ChildCanisterState,
  undefined,
  AsyncThunkConfig<{ error: Error }>
>('childCanister/create', async (_, { rejectWithValue }) => {
  const authClient = await AuthClient.create();

  if (!authClient || !authClient.isAuthenticated()) {
    return rejectWithValue({
      error: { unauthorized: 'Failed to use auth client.' },
    });
  }

  const identity = await authClient.getIdentity();
  const actor = createNFTBarterActor({
    agentOptions: { identity },
  });

  const res = await actor.mintChildCanister();
  if ('ok' in res) {
    return { canisterIds: [res.ok] };
  } else {
    return rejectWithValue({
      error: res.err,
    });
  }
});

export const childCanisterSlice = createSlice({
  name: 'childCanister',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getChildCanisters.fulfilled, (state, action) => {
      state.canisterIds = action.payload?.canisterIds;
    });
    builder.addCase(getChildCanisters.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
    builder.addCase(createChildCanister.fulfilled, (state, action) => {
      state.canisterIds = [
        ...state.canisterIds,
        ...action.payload?.canisterIds,
      ];
    });
    builder.addCase(createChildCanister.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const selectCanisterIds = (state: RootState) =>
  state.childCanister.canisterIds;
export const selectError = (state: RootState) => state.childCanister.error;

export default childCanisterSlice.reducer;
