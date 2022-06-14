import { createSlice, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';

import { RootState, AsyncThunkConfig } from '../../app/store';

// Slices
import { removeFromWithdrawableNfts } from '../nfts/nftsSlice';

// Declarations
import { Error } from '../../../../declarations/ChildCanister/ChildCanister.did.js';
import { createActor } from '../../../../declarations/ChildCanister';

export interface WithdrawState {
  error?: Error;
}

const initialState: WithdrawState = {};

export const withdrawNft = createAsyncThunk<
  WithdrawState,
  {
    childCanisterId: string;
    tokenIndexOnChildCanister: number;
    tokenId: string;
  },
  AsyncThunkConfig<{ error: Error }>
>(
  'withdraw/withdrawNft',
  async (
    { childCanisterId, tokenIndexOnChildCanister, tokenId },
    { rejectWithValue, dispatch }
  ) => {
    const authClient = await AuthClient.create();
    if (!authClient || !authClient.isAuthenticated()) {
      return rejectWithValue({
        error: { unauthorized: 'Failed to use auth client.' },
      });
    }
    const identity = await authClient.getIdentity();

    const actor = createActor(childCanisterId, {
      agentOptions: { identity },
    });

    const res = await actor.withdrawNft(BigInt(tokenIndexOnChildCanister));
    if ('err' in res) {
      return rejectWithValue({ error: res.err });
    }

    dispatch(removeFromWithdrawableNfts(tokenId));

    return {};
  }
);

export const withdrawSlice = createSlice({
  name: 'withdraw',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(withdrawNft.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const selectError = (state: RootState) => state.withdraw.error;

export default withdrawSlice.reducer;
