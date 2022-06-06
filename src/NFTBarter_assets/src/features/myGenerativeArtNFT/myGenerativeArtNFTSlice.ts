import { createSlice, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';
import { RootState, AsyncThunkConfig } from '../../app/store';
import { generateTokenIdentifier, decodeTokenId } from '../../utils/ext';
import { GENERATIVE_ART_NFT_CANISTER_ID as canisterId } from '../../utils/canisterId';
import { createChildCanisterActorByCanisterId } from '../../utils/createChildCanisterActor';

import { getMyChildCanisters } from '../childCanister/childCanisterSlice';

import {
  User,
  TokenIdentifier,
} from '../../../../declarations/GenerativeArtNFT/GenerativeArtNFT.did.js';
import { createActor } from '../../../../declarations/GenerativeArtNFT';

const NftStatus = {
  WALLET: 'wallet',
  STAY: 'stay',
  EXHIBIT: 'exhibit',
  BID: 'bid',
} as const;

// type NftStatus = "wallet" | "stay" | "exhibit" | "bid"
export type NftStatus = typeof NftStatus[keyof typeof NftStatus];

const compareNft = (a: GenerativeArtNFT, b: GenerativeArtNFT) =>
  a.tokenIndex - b.tokenIndex;

export interface GenerativeArtNFT {
  tokenId: string;
  tokenIndex: number;
  status: NftStatus;
}

export interface MyGenerativeArtNFTState {
  nftsOnWallet: GenerativeArtNFT[];
  nftsOnChildCanisters: GenerativeArtNFT[];
  error?: string;
}

const initialState: MyGenerativeArtNFTState = {
  nftsOnWallet: [],
  nftsOnChildCanisters: [],
};

export const fetchNFTsOnChildCanister = createAsyncThunk<
  MyGenerativeArtNFTState,
  undefined,
  AsyncThunkConfig<{ error: string }>
>(
  'myGenerativeArtNFT/fetchNFTsOnChildCanister',
  async (_, { rejectWithValue, dispatch }) => {
    const authClient = await AuthClient.create();

    if (!authClient || !authClient.isAuthenticated()) {
      return rejectWithValue({ error: 'Failed to use auth client.' });
    }

    const identity = await authClient.getIdentity();

    let childCanisterIds: string[];
    try {
      const action = await dispatch(getMyChildCanisters());
      const state = unwrapResult(action);
      childCanisterIds = state.canisterIds;
    } catch (rejectedValueOrSerializedError) {
      return rejectWithValue({
        error: 'Error occured during fetching child canisters.',
      });
    }

    const nfts = await Promise.all(
      childCanisterIds.map(async (childCanisterId) => {
        const actor = createChildCanisterActorByCanisterId(childCanisterId)({
          agentOptions: { identity },
        });
        const assets = await actor.getAssets();
        const nfts: GenerativeArtNFT[] = assets.map((asset) => {
          const [_, stat] = asset;
          let tokenId: TokenIdentifier;
          let nftStatus: NftStatus;
          if ('Stay' in stat) {
            tokenId = stat.Stay.myExtStandardNft;
            nftStatus = 'stay';
          } else if ('Exhibit' in stat) {
            tokenId = stat.Exhibit.myExtStandardNft;
            nftStatus = 'exhibit';
          } else if ('Bid' in stat) {
            tokenId = stat.Bid.myExtStandardNft;
            nftStatus = 'bid';
          } else {
            throw new Error('Invalid token');
          }
          const { index } = decodeTokenId(tokenId);
          return {
            tokenId,
            tokenIndex: index,
            status: nftStatus,
          };
        });
        return nfts;
      })
    );
    return { nftsOnChildCanisters: nfts.flat(), nftsOnWallet: [] };
  }
);

export const fetchNFTsOnWallet = createAsyncThunk<
  MyGenerativeArtNFTState,
  undefined,
  AsyncThunkConfig<{ error: string }>
>('myGenerativeArtNFT/fetchNFTsOnWallet', async (_, { rejectWithValue }) => {
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
      nftsOnWallet: (await actor.getTokenIndexOwnedByUser(user)).map(
        (tokenIndex) => {
          const tokenId = generateTokenIdentifier(canisterId, tokenIndex);
          return { tokenId, tokenIndex, status: 'wallet' };
        }
      ),
      nftsOnChildCanisters: [],
    };
  } catch {
    return rejectWithValue({ error: 'Mint failed.' });
  }
});

export const myGenerativeArtNFTSlice = createSlice({
  name: 'myGenerativeArtNFT',
  initialState,
  reducers: {
    updateNft(state, action: { payload: GenerativeArtNFT }) {
      const updatedNft = action.payload;
      if (updatedNft.status === 'wallet') {
        // Remove the NFT from nftsOnChildCanisters and add it to nftsOnWallet
        state.nftsOnChildCanisters = state.nftsOnChildCanisters.filter(
          (nft) => nft.tokenId !== updatedNft.tokenId
        );
        state.nftsOnWallet = [...state.nftsOnWallet, updatedNft];
      } else {
        // Remove the NFT from nftsOnWallet and add it to nftsOnChildCanisters
        state.nftsOnWallet = state.nftsOnWallet.filter(
          (nft) => nft.tokenId !== updatedNft.tokenId
        );
        state.nftsOnChildCanisters = [
          ...state.nftsOnChildCanisters,
          updatedNft,
        ];
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNFTsOnWallet.fulfilled, (state, action) => {
      state.nftsOnWallet = action.payload?.nftsOnWallet;
    });
    builder.addCase(fetchNFTsOnWallet.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
    builder.addCase(fetchNFTsOnChildCanister.fulfilled, (state, action) => {
      state.nftsOnChildCanisters = action.payload?.nftsOnChildCanisters;
    });
    builder.addCase(fetchNFTsOnChildCanister.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const { updateNft } = myGenerativeArtNFTSlice.actions;

export const selectError = (state: RootState) => state.myGenerativeArtNFT.error;
export const selectNftsOnWallet = (state: RootState) =>
  state.myGenerativeArtNFT.nftsOnWallet.sort(compareNft);
export const selectNftsOnChildCanister = (state: RootState) =>
  state.myGenerativeArtNFT.nftsOnChildCanisters.sort(compareNft);
export const selectAllNfts = (state: RootState) =>
  [
    ...state.myGenerativeArtNFT.nftsOnWallet,
    ...state.myGenerativeArtNFT.nftsOnChildCanisters,
  ].sort(compareNft);
export default myGenerativeArtNFTSlice.reducer;
