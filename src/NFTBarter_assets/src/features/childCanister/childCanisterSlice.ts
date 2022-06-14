import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';

import { RootState, AsyncThunkConfig } from '../../app/store';
import { createNFTBarterActor } from '../../utils/createNFTBarterActor';
import { Error } from '../../../../declarations/NFTBarter/NFTBarter.did';

export interface ChildCanisterState {
  canisterIds: string[];
  allChildCanisters: [string, string][];
  error?: Error;
}

const initialState: ChildCanisterState = {
  canisterIds: [],
  allChildCanisters: [],
};

export const getAllChildCanisters = createAsyncThunk<
  { allChildCanisters: [string, string][] },
  undefined,
  AsyncThunkConfig<{ error: Error }>
>('childCanister/getAll', async (_, { rejectWithValue }) => {
  const actor = createNFTBarterActor({});

  try {
    const allChildCanisters: [string, string][] = (
      await actor.getAllChildCanisters()
    ).map((data) => {
      return [data[0].toText(), data[1].toText()];
    });

    return {
      allChildCanisters,
    };
  } catch {
    return rejectWithValue({
      error: { other: 'Failed to fetch.' },
    });
  }
});

export const getMyChildCanisters = createAsyncThunk<
  { canisterIds: string[] },
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
    return {
      canisterIds: res.ok.map((p) => p.toText()),
    };
  } else {
    return {
      canisterIds: [],
    };
  }
});

export const createChildCanister = createAsyncThunk<
  { canisterIds: string[] },
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
    return { canisterIds: [res.ok.toText()] };
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
    builder.addCase(getMyChildCanisters.fulfilled, (state, action) => {
      state.canisterIds = action.payload?.canisterIds;
    });
    builder.addCase(getMyChildCanisters.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
    builder.addCase(getAllChildCanisters.fulfilled, (state, action) => {
      state.allChildCanisters = action.payload?.allChildCanisters;
    });
    builder.addCase(getAllChildCanisters.rejected, (state, action) => {
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
export const selectAllChildCanisters = (state: RootState) =>
  state.childCanister.allChildCanisters;
export const selectError = (state: RootState) => state.childCanister.error;

export default childCanisterSlice.reducer;
