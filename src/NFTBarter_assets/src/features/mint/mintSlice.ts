import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';
import { RootState, AsyncThunkConfig } from '../../app/store';
import { generateTokenIdentifier } from '../../utils/ext';
import { GENERATIVE_ART_NFT_CANISTER_ID as canisterId } from '../../utils/canisterId';

import {
  User,
  MintRequest,
} from '../../../../declarations/GenerativeArtNFT/GenerativeArtNFT.did.js';
import { createActor } from '../../../../declarations/GenerativeArtNFT';

export interface MintState {
  tokenId?: string;
  tokenIndex?: number;
  error?: string;
}

const initialState: MintState = {};

export const mint = createAsyncThunk<
  MintState,
  undefined,
  AsyncThunkConfig<{ error: string }>
>('mint/mintNFT', async (_, { rejectWithValue }) => {
  const authClient = await AuthClient.create();

  if (!authClient || !authClient.isAuthenticated()) {
    return rejectWithValue({ error: 'Failed to use auth client.' });
  }

  const identity = await authClient.getIdentity();

  const actor = createActor(canisterId, {
    agentOptions: { identity },
  });

  const user: User = {
    principal: identity.getPrincipal(),
  };
  const mintRequest: MintRequest = {
    to: user,
    metadata: [],
  };

  try {
    const tokenIndex = await actor.mintNFT(mintRequest);
    const tokenId = generateTokenIdentifier(canisterId, tokenIndex);
    return { tokenId, tokenIndex };
  } catch {
    return rejectWithValue({ error: 'Mint failed.' });
  }
});

export const mintSlice = createSlice({
  name: 'mint',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(mint.fulfilled, (state, action) => {
      state.tokenId = action.payload?.tokenId;
      state.tokenIndex = action.payload?.tokenIndex;
    });
    builder.addCase(mint.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const selectError = (state: RootState) => state.mint.error;
export const selectTokenId = (state: RootState) => state.mint.tokenId;
export const selectTokenIndex = (state: RootState) => state.mint.tokenIndex;

export default mintSlice.reducer;
