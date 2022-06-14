import { createSlice, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';
import { RootState, AsyncThunkConfig } from '../../app/store';
import { generateTokenIdentifier } from '../../utils/ext';
import { GENERATIVE_ART_NFT_CANISTER_ID as canisterId } from '../../utils/canisterId';
import { fetchAllNftsOnChildCanister, compareNft } from '../../utils/nft';
import { Nft } from '../../models/NftModel';
import { getMyChildCanisters } from '../childCanister/childCanisterSlice';

import { User } from '../../../../declarations/GenerativeArtNFT/GenerativeArtNFT.did.js';
import { createActor } from '../../../../declarations/GenerativeArtNFT';

export interface MyNFTState {
  nftsOnMyWallet: Nft[];
  nftsOnMyChildCanisters: Nft[];
  error?: string;
}

const initialState: MyNFTState = {
  nftsOnMyWallet: [],
  nftsOnMyChildCanisters: [],
};

export const fetchNFTsOnChildCanister = createAsyncThunk<
  { nftsOnMyChildCanisters: Nft[] },
  undefined,
  AsyncThunkConfig<{ error: string }>
>('nfts/fetchNFTsOnChildCanister', async (_, { rejectWithValue, dispatch }) => {
  const authClient = await AuthClient.create();
  if (!authClient || !authClient.isAuthenticated()) {
    return rejectWithValue({ error: 'Failed to use auth client.' });
  }
  const identity = await authClient.getIdentity();

  const action = await dispatch(getMyChildCanisters());
  const state = unwrapResult(action);
  const childCanisterIds = state.canisterIds;

  const nfts = await Promise.all(
    childCanisterIds.map(async (childCanisterId) => {
      return await fetchAllNftsOnChildCanister(
        Principal.fromText(childCanisterId),
        identity
      );
    })
  );
  return { nftsOnMyChildCanisters: nfts.flat().sort(compareNft) };
});

export const fetchMyNFTsOnWallet = createAsyncThunk<
  { nftsOnMyWallet: Nft[] },
  undefined,
  AsyncThunkConfig<{ error: string }>
>('nfts/fetchMyNFTsOnWallet', async (_, { rejectWithValue }) => {
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
      nftsOnMyWallet: (await actor.getTokenIndexOwnedByUser(user))
        .map((tokenIndex): Nft => {
          const tokenId = generateTokenIdentifier(canisterId, tokenIndex);
          return { tokenId, tokenIndex, status: 'wallet' };
        })
        .sort(compareNft),
    };
  } catch {
    return rejectWithValue({ error: 'Mint failed.' });
  }
});

export const nftsSlice = createSlice({
  name: 'nfts',
  initialState,
  reducers: {
    updateNft(state, action: { payload: Nft }) {
      const updatedNft = action.payload;
      if (updatedNft.status === 'wallet') {
        // Remove the NFT from nftsOnMyChildCanisters and add it to nftsOnMyWallet
        state.nftsOnMyChildCanisters = state.nftsOnMyChildCanisters.filter(
          (nft) => nft.tokenId !== updatedNft.tokenId
        );
        state.nftsOnMyWallet = [...state.nftsOnMyWallet, updatedNft];
      } else {
        // Remove the NFT from nftsOnMyWallet and add it to nftsOnMyChildCanisters
        state.nftsOnMyWallet = state.nftsOnMyWallet.filter(
          (nft) => nft.tokenId !== updatedNft.tokenId
        );
        state.nftsOnMyChildCanisters = [
          ...state.nftsOnMyChildCanisters,
          updatedNft,
        ];
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMyNFTsOnWallet.fulfilled, (state, action) => {
      state.nftsOnMyWallet = action.payload?.nftsOnMyWallet;
    });
    builder.addCase(fetchMyNFTsOnWallet.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
    builder.addCase(fetchNFTsOnChildCanister.fulfilled, (state, action) => {
      state.nftsOnMyChildCanisters = action.payload?.nftsOnMyChildCanisters;
    });
    builder.addCase(fetchNFTsOnChildCanister.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const { updateNft } = nftsSlice.actions;

export const selectError = (state: RootState) => state.nfts.error;
export const selectNftsOnWallet = (state: RootState) =>
  state.nfts.nftsOnMyWallet;
export const selectNftsOnChildCanister = (state: RootState) =>
  state.nfts.nftsOnMyChildCanisters;
export const selectAllNfts = (state: RootState) => [
  ...state.nfts.nftsOnMyWallet,
  ...state.nfts.nftsOnMyChildCanisters,
];
export default nftsSlice.reducer;
