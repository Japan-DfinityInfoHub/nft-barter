import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';
import { RootState, AsyncThunkConfig } from '../../app/store';
import { generateTokenIdentifier } from '../../utils/ext';

import { User } from '../../../../declarations/GenerativeArtNFT/GenerativeArtNFT.did.js';
import { createActor } from '../../../../declarations/GenerativeArtNFT';

const canisterId =
  process.env.DFX_NETWORK === 'ic' || !process.env.LOCAL_NFT_CANISTER_ID
    ? 'REPLACE_TO_CANISTER_ID'
    : process.env.LOCAL_NFT_CANISTER_ID;

export interface GenerativeArtNFT {
  tokenId: string;
  tokenIndex: number;
}

export interface MyGenerativeArtNFTState {
  nfts: GenerativeArtNFT[];
  error?: string;
}

const initialState: MyGenerativeArtNFTState = {
  nfts: [],
};

export const fetchNFTs = createAsyncThunk<
  MyGenerativeArtNFTState,
  undefined,
  AsyncThunkConfig<{ error: string }>
>('myGenerativeArtNFT/fetchNFTs', async (_, { rejectWithValue }) => {
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

  try {
    return {
      nfts: (await actor.getTokenIndexOwnedByUser(user)).map((tokenIndex) => {
        const tokenId = generateTokenIdentifier(canisterId, tokenIndex);
        return { tokenId, tokenIndex };
      }),
    };
  } catch {
    return rejectWithValue({ error: 'Mint failed.' });
  }
});

export const myGenerativeArtNFTSlice = createSlice({
  name: 'myGenerativeArtNFT',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchNFTs.fulfilled, (state, action) => {
      state.nfts = action.payload?.nfts;
    });
    builder.addCase(fetchNFTs.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const selectError = (state: RootState) => state.myGenerativeArtNFT.error;
export const selectNfts = (state: RootState) => state.myGenerativeArtNFT.nfts;

export default myGenerativeArtNFTSlice.reducer;
