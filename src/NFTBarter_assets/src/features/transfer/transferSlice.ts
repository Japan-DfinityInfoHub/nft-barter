import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

import { RootState, AsyncThunkConfig } from '../../app/store';
import { removeTokenById } from '../myGenerativeArtNFT/myGenerativeArtNFTSlice';
import { GENERATIVE_ART_NFT_CANISTER_ID as canisterId } from '../../utils/canisterId';

import {
  User,
  TokenIdentifier,
  TransferRequest,
  AccountIdentifier,
} from '../../../../declarations/GenerativeArtNFT/GenerativeArtNFT.did';
import { createActor } from '../../../../declarations/GenerativeArtNFT';

type Error =
  | {
      CannotNotify: AccountIdentifier;
    }
  | {
      InsufficientBalance: null;
    }
  | {
      InvalidToken: TokenIdentifier;
    }
  | {
      Rejected: null;
    }
  | {
      Unauthorized: AccountIdentifier;
    }
  | {
      Other: string;
    };

export interface TransferState {
  success: boolean;
  error?: Error;
}

const initialState: TransferState = {
  success: false,
};

export const transfer = createAsyncThunk<
  TransferState,
  {
    childCanisterId: string;
    tokenId: TokenIdentifier;
  },
  AsyncThunkConfig<{ error: Error }>
>(
  'transfer',
  async (
    { tokenId, childCanisterId },
    { rejectWithValue, getState, dispatch }
  ) => {
    const authClient = await AuthClient.create();

    if (!authClient) {
      return rejectWithValue({
        error: { Unauthorized: 'Unauthorized error.' },
      });
    }

    const identity = await authClient.getIdentity();
    const actor = createActor(canisterId, {
      agentOptions: { identity },
    });

    // Check if user owns childCanisterId
    let childCanisterIds = getState().childCanister.canisterIds;
    if (!childCanisterIds.find((c) => c === childCanisterId)) {
      return rejectWithValue({
        error: { Other: 'It is not your child canister.' },
      });
    }

    // Transfer NFT to child canister
    const user: User = {
      principal: identity.getPrincipal(),
    };
    const childCanister: User = {
      principal: Principal.fromText(childCanisterId),
    };
    const transferRequest: TransferRequest = {
      from: user,
      to: childCanister,
      token: tokenId,
      notify: false,
      memo: [],
      subaccount: [],
      amount: BigInt(1),
    };
    const res = await actor.transfer(transferRequest);
    if ('ok' in res) {
      // Delist NFT card
      dispatch(removeTokenById(tokenId));
      return { success: true };
    } else {
      return rejectWithValue({ error: res.err });
    }
  }
);

export const transferSlice = createSlice({
  name: 'transfer',
  initialState,
  reducers: {
    reset: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(transfer.fulfilled, (state, action) => {});
    builder.addCase(transfer.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const { reset } = transferSlice.actions;

export const selectSuccess = (state: RootState) => state.transfer.success;
export const selectError = (state: RootState) => state.transfer.error;

export default transferSlice.reducer;
