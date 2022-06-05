import { createSlice, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';

import { RootState, AsyncThunkConfig } from '../../app/store';
import {
  getChildCanisters,
  createChildCanister,
} from '../childCanister/childCanisterSlice';
import { transfer } from '../transfer/transferSlice';

import { Error } from '../../../../declarations/NFTBarter/NFTBarter.did';
import { Nft } from '../../../../declarations/ChildCanister/ChildCanister.did';

import { createChildCanisterActorByCanisterId } from '../../utils/createChildCanisterActor';

export interface ExhibitState {
  childCanisterId?: string;
  tokenIndexOnChildCanister?: bigint;
  status: {
    fetchChildCanisters?: boolean;
    createChildCanister?: boolean;
    transferNft?: boolean;
    importNft?: boolean;
    exhibitNft?: boolean;
    all?: boolean;
  };
  error?: Error;
}

const initialState: ExhibitState = {
  status: {
    fetchChildCanisters: false,
    createChildCanister: false,
    transferNft: false,
    importNft: false,
    exhibitNft: false,
    all: false,
  },
};

export const exhibit = createAsyncThunk<
  ExhibitState,
  { tokenId: string },
  AsyncThunkConfig<{ error: Error }>
>('exhibit', async ({ tokenId }, { rejectWithValue, dispatch }) => {
  dispatch(reset());

  const authClient = await AuthClient.create();

  if (!authClient || !authClient.isAuthenticated()) {
    return rejectWithValue({
      error: { unauthorized: 'Failed to use auth client.' },
    });
  }
  const identity = await authClient.getIdentity();

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
  dispatch(finishFetchingChildCanisterIds());

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
  dispatch(finishCreatingChildCanister());

  // Transfer NFT to child canister
  try {
    await dispatch(transfer({ tokenId, childCanisterId }));
  } catch {
    return rejectWithValue({
      error: {
        other: 'Error occured during transfering NFT to child canisters.',
      },
    });
  }
  dispatch(finishTransferingNft());

  const actor = createChildCanisterActorByCanisterId(childCanisterId)({
    agentOptions: { identity },
  });
  const nft: Nft = { myExtStandardNft: tokenId };

  // Import NFT into child canister
  let tokenIndexOnChildCanister: bigint;
  try {
    const res = await actor.importMyNft(nft);
    if ('ok' in res) {
      tokenIndexOnChildCanister = res.ok;
    } else {
      return rejectWithValue({
        error: res.err,
      });
    }
  } catch {
    return rejectWithValue({
      error: {
        other: 'Error occured during importing NFT to child canisters.',
      },
    });
  }
  dispatch(finishImportingNft());

  // Exhibit NFT
  try {
    const res = await actor.exhibitMyNft(tokenIndexOnChildCanister);
    if ('ok' in res) {
      // do nothing
    } else {
      return rejectWithValue({
        error: res.err,
      });
    }
  } catch {
    return rejectWithValue({
      error: {
        other: 'Error occured during exhibiting NFT to child canisters.',
      },
    });
  }
  dispatch(finishExhibitingNft());

  return { childCanisterId, tokenIndexOnChildCanister, status: { all: true } };
});

export const exhibitSlice = createSlice({
  name: 'exhibit',
  initialState,
  reducers: {
    reset: (state) => {
      state = initialState;
    },
    finishFetchingChildCanisterIds: (state) => {
      state.status = { ...state.status, fetchChildCanisters: true };
    },
    finishCreatingChildCanister: (state) => {
      state.status = { ...state.status, createChildCanister: true };
    },
    finishTransferingNft: (state) => {
      state.status = { ...state.status, transferNft: true };
    },
    finishImportingNft: (state) => {
      state.status = { ...state.status, importNft: true };
    },
    finishExhibitingNft: (state) => {
      state.status = { ...state.status, exhibitNft: true };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(exhibit.fulfilled, (state, action) => {
      state.childCanisterId = action.payload?.childCanisterId;
      state.tokenIndexOnChildCanister =
        action.payload?.tokenIndexOnChildCanister;
      state.status = { ...state.status, ...action.payload?.status };
    });
    builder.addCase(exhibit.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const {
  reset,
  finishFetchingChildCanisterIds,
  finishCreatingChildCanister,
  finishTransferingNft,
  finishImportingNft,
  finishExhibitingNft,
} = exhibitSlice.actions;

export const selectChildCanisterId = (state: RootState) =>
  state.exhibit.childCanisterId;
export const selectError = (state: RootState) => state.exhibit.error;
export const selectStatus = (state: RootState) => state.exhibit.status;

export default exhibitSlice.reducer;
