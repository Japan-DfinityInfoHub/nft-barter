import { createSlice, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';

import { RootState, AsyncThunkConfig } from '../../app/store';
import {
  getMyChildCanisters,
  createChildCanister,
} from '../childCanister/childCanisterSlice';
import { transfer } from '../transfer/transferSlice';
import { moveFromWalletToChildCanister } from '../nfts/nftsSlice';

import { Error } from '../../../../declarations/NFTBarter/NFTBarter.did';
import { Nft } from '../../../../declarations/ChildCanister/ChildCanister.did';

import { createChildCanisterActorByCanisterId } from '../../utils/createChildCanisterActor';
import { decodeTokenId } from '../../utils/ext';

export interface BidState {
  childCanisterId?: string;
  bidTokenIndex?: number;
  status: {
    isFetchingChildCanistersFinished: boolean;
    isCreatingChildCanisterFinished: boolean;
    isTransferNftFinished: boolean;
    isImportingNftFinished: boolean;
    isBiddingNftFinished: boolean;
    allFinished: boolean;
  };
  error?: Error;
}

const initialState: BidState = {
  status: {
    isFetchingChildCanistersFinished: false,
    isCreatingChildCanisterFinished: false,
    isTransferNftFinished: false,
    isImportingNftFinished: false,
    isBiddingNftFinished: false,
    allFinished: false,
  },
};

export const offerBid = createAsyncThunk<
  BidState,
  { bidTokenId: string; exhibitCanisterId: string; exhibitTokenIndex: number },
  AsyncThunkConfig<{ error: Error }>
>(
  'bid/offer',
  async (
    { bidTokenId, exhibitCanisterId, exhibitTokenIndex },
    { rejectWithValue, dispatch }
  ) => {
    const authClient = await AuthClient.create();

    if (!authClient || !authClient.isAuthenticated()) {
      return rejectWithValue({
        error: { unauthorized: 'Failed to use auth client.' },
      });
    }
    const identity = await authClient.getIdentity();

    const { index: tokenIndex } = decodeTokenId(bidTokenId);

    // Get user's child canister IDs.
    let childCanisterIds: string[];
    try {
      const action = await dispatch(getMyChildCanisters());
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
      await dispatch(transfer({ tokenId: bidTokenId, childCanisterId }));
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
    const bidNft: Nft = { MyExtStandardNft: bidTokenId };

    // Import NFT into child canister
    let bidTokenIndex: number;
    try {
      const res = await actor.importMyNft(bidNft);
      if ('ok' in res) {
        bidTokenIndex = Number(res.ok);
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

    // Offer bid
    try {
      const res = await actor.offerBidMyNft({
        exhibitCanisterId,
        bidToken: BigInt(bidTokenIndex),
        exhibitToken: BigInt(exhibitTokenIndex),
      });
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
    dispatch(finishBiddingNft());

    await new Promise((resolve) => setTimeout(resolve, 500));
    dispatch(
      moveFromWalletToChildCanister({
        tokenId: bidTokenId,
        tokenIndex,
        status: 'bidOffering',
        childCanisterId,
        tokenIndexOnChildCanister: bidTokenIndex,
      })
    );

    return {
      childCanisterId,
      bidTokenIndex: Number(bidTokenIndex),
      status: {
        isFetchingChildCanistersFinished: true,
        isCreatingChildCanisterFinished: true,
        isTransferNftFinished: true,
        isImportingNftFinished: true,
        isBiddingNftFinished: true,
        allFinished: true,
      },
    };
  }
);

export const bidSlice = createSlice({
  name: 'bid',
  initialState,
  reducers: {
    reset: (state) => {
      state.status = {
        isFetchingChildCanistersFinished: false,
        isCreatingChildCanisterFinished: false,
        isTransferNftFinished: false,
        isImportingNftFinished: false,
        isBiddingNftFinished: false,
        allFinished: false,
      };
    },
    finishFetchingChildCanisterIds: (state) => {
      state.status = {
        ...state.status,
        isFetchingChildCanistersFinished: true,
      };
    },
    finishCreatingChildCanister: (state) => {
      state.status = { ...state.status, isCreatingChildCanisterFinished: true };
    },
    finishTransferingNft: (state) => {
      state.status = { ...state.status, isTransferNftFinished: true };
    },
    finishImportingNft: (state) => {
      state.status = { ...state.status, isImportingNftFinished: true };
    },
    finishBiddingNft: (state) => {
      state.status = { ...state.status, isBiddingNftFinished: true };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(offerBid.fulfilled, (state, action) => {
      state.childCanisterId = action.payload?.childCanisterId;
      state.bidTokenIndex = action.payload?.bidTokenIndex;
      state.status = { ...state.status, ...action.payload?.status };
    });
    builder.addCase(offerBid.rejected, (state, action) => {
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
  finishBiddingNft,
} = bidSlice.actions;

export const selectChildCanisterId = (state: RootState) =>
  state.bid.childCanisterId;
export const selectError = (state: RootState) => state.bid.error;
export const selectStatus = (state: RootState) => state.bid.status;

export default bidSlice.reducer;
