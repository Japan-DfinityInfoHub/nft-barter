import {
  createSlice,
  createAsyncThunk,
  unwrapResult,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

import { RootState, AsyncThunkConfig } from '../../app/store';
import { Nft, NftOnChildCanisters } from '../../models/NftModel';
import { getMyChildCanisters } from '../childCanister/childCanisterSlice';

// Declarations
import { User } from '../../../../declarations/GenerativeArtNFT/GenerativeArtNFT.did.js';
import { createActor } from '../../../../declarations/GenerativeArtNFT';

// Utils
import { generateTokenIdentifier } from '../../utils/ext';
import { GENERATIVE_ART_NFT_CANISTER_ID as canisterId } from '../../utils/canisterId';
import {
  fetchAllNftsOnChildCanister,
  compareNft,
  isWithdrawable,
} from '../../utils/nft';

export interface MyNFTState {
  nftsOnMyWallet: Nft[];
  nftsOnMyChildCanisters: NftOnChildCanisters[];
  withdrawableNfts: NftOnChildCanisters[];
  error?: string;
}

const initialState: MyNFTState = {
  nftsOnMyWallet: [],
  nftsOnMyChildCanisters: [],
  withdrawableNfts: [],
};

export const fetchWithdrawableNfts = createAsyncThunk<
  { withdrawableNfts: NftOnChildCanisters[] },
  undefined,
  AsyncThunkConfig<{ error: string }>
>('nfts/fetchWithdrawableNfts', async (_, { dispatch }) => {
  const action = await dispatch(fetchNFTsOnChildCanister());
  const state = unwrapResult(action);
  const nftsOnMyChildCanisters = state.nftsOnMyChildCanisters;

  const withdrawableNfts = nftsOnMyChildCanisters.filter((nft) => {
    const { status } = nft;
    return isWithdrawable(status);
  });

  return { withdrawableNfts };
});

export const fetchNFTsOnChildCanister = createAsyncThunk<
  { nftsOnMyChildCanisters: NftOnChildCanisters[] },
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

  const unSortedNfts: NftOnChildCanisters[] = (
    await Promise.all(
      childCanisterIds.map(async (childCanisterId) => {
        const nfts = await fetchAllNftsOnChildCanister(
          Principal.fromText(childCanisterId),
          identity
        );
        return nfts
          .filter((nft) => {
            return nft.status !== 'exhibitEnd';
          })
          .map((nft) => {
            return {
              childCanisterId,
              ...nft,
            };
          });
      })
    )
  ).flat();
  const nftsOnMyChildCanisters =
    unSortedNfts.length > 0 ? unSortedNfts.sort(compareNft) : unSortedNfts;

  return { nftsOnMyChildCanisters };
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

  const unSortedNftsOnMyWallet = (
    await actor.getTokenIndexOwnedByUser(user)
  ).map((tokenIndex): Nft => {
    const tokenId = generateTokenIdentifier(canisterId, tokenIndex);
    return { tokenId, tokenIndex, status: 'wallet' };
  });

  const nftsOnMyWallet =
    unSortedNftsOnMyWallet.length > 0
      ? unSortedNftsOnMyWallet.sort(compareNft)
      : unSortedNftsOnMyWallet;

  try {
    return {
      nftsOnMyWallet,
    };
  } catch {
    return rejectWithValue({ error: 'Mint failed.' });
  }
});

export const nftsSlice = createSlice({
  name: 'nfts',
  initialState,
  reducers: {
    moveFromChildCanisterToWallet(state, action: PayloadAction<Nft>) {
      const updatedNft = action.payload;
      state.nftsOnMyChildCanisters = state.nftsOnMyChildCanisters.filter(
        (nft) => nft.tokenId !== updatedNft.tokenId
      );
      state.nftsOnMyWallet = [...state.nftsOnMyWallet, updatedNft];
    },
    moveFromWalletToChildCanister(
      state,
      action: PayloadAction<NftOnChildCanisters>
    ) {
      const updatedNft = action.payload;
      state.nftsOnMyWallet = state.nftsOnMyWallet.filter(
        (nft) => nft.tokenId !== updatedNft.tokenId
      );
      state.nftsOnMyChildCanisters = [
        ...state.nftsOnMyChildCanisters,
        updatedNft,
      ];
    },
    removeFromWithdrawableNfts(state, action: PayloadAction<string>) {
      state.withdrawableNfts = state.withdrawableNfts.filter((nft): boolean => {
        return nft.tokenId !== action.payload;
      });
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
    builder.addCase(fetchWithdrawableNfts.fulfilled, (state, action) => {
      state.withdrawableNfts = action.payload?.withdrawableNfts;
    });
  },
});

export const {
  moveFromChildCanisterToWallet,
  moveFromWalletToChildCanister,
  removeFromWithdrawableNfts,
} = nftsSlice.actions;

export const selectError = (state: RootState) => state.nfts.error;
export const selectNftsOnWallet = (state: RootState) =>
  state.nfts.nftsOnMyWallet;
export const selectNftsOnChildCanister = (state: RootState) =>
  state.nfts.nftsOnMyChildCanisters;
export const selectAllNfts = (state: RootState) => [
  ...state.nfts.nftsOnMyWallet,
  ...state.nfts.nftsOnMyChildCanisters,
];
export const selectWithdrawableNfts = (state: RootState) =>
  state.nfts.withdrawableNfts;

export default nftsSlice.reducer;
