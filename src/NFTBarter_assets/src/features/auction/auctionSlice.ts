import { createSlice, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { RootState, AsyncThunkConfig } from '../../app/store';
import { NftStatus } from '../../models/NftModel';

// Slices
import { getAllChildCanisters } from '../childCanister/childCanisterSlice';

// Declarations
import { Error } from '../../../../declarations/NFTBarter/NFTBarter.did';
import { createActor as createActorNFT } from '../../../../declarations/GenerativeArtNFT';
import { createActor as createActorCC } from '../../../../declarations/ChildCanister';

// Utils
import {
  decodeTokenId,
  principalToAccountIdentifier,
  generateTokenIdentifier,
} from '../../utils/ext';
import {
  getTokenIdAndNftStatusFromAsset,
  getTokenIdAndStatusFromNftStatusCandid,
} from '../../utils/nft';

export type Offer = {
  bidTokenIndex: number;
  bidChildCanister: string;
  bidChildCanisterAid: string;
  tokenId: string;
  nftStatus: NftStatus;
};

export interface AuctionState {
  isExhibit: boolean;
  isYours: boolean;
  bearer?: string;
  exhibitId?: string;
  ownerOfExhibitCanister?: string;
  offers?: Offer[];
  error?: Error;
}

const initialState: AuctionState = {
  isExhibit: false,
  isYours: false,
};

export const fetchBearer = async (canisterId: string, tokenId: string) => {
  const actor = createActorNFT(canisterId);
  return await actor.bearer(tokenId);
};

export const fetchExhibitTokenIndex = async (
  childCanisterId: string,
  tokenId: string
) => {
  const actor = createActorCC(childCanisterId);
  const assets = await actor.getAssets();
  const asset = assets
    .map((asset) => getTokenIdAndNftStatusFromAsset(asset))
    .find((nft) => nft.tokenId === tokenId && nft.status === 'exhibit');
  if (!asset) {
    return;
  }
  const { tokenIndexOnChildCanister } = asset;
  const exhibitId = generateTokenIdentifier(
    childCanisterId,
    tokenIndexOnChildCanister
  );
  return exhibitId;
};

const getChildCanisterAndItsOwner = (
  data: [string, string][],
  ownerAid: string
) => {
  return data.find(([canisterId, _]) => {
    const aid = principalToAccountIdentifier(canisterId, 0);
    return aid == ownerAid;
  });
};

export const fetchAuction = createAsyncThunk<
  AuctionState,
  { tokenId: string },
  AsyncThunkConfig<{ error: Error }>
>('auction', async ({ tokenId }, { rejectWithValue, getState, dispatch }) => {
  const { canisterId } = decodeTokenId(tokenId);
  // Get walletAid and userPrincipal
  const walletAid = getState().auth.accountId;
  const userPrincipal = getState().auth.principal;

  // Fetch bearer
  let bearer: string = '';
  const resOfFetchBearer = await fetchBearer(canisterId, tokenId);
  if ('ok' in resOfFetchBearer) {
    bearer = resOfFetchBearer.ok;
  }
  if (bearer === '') {
    rejectWithValue({ error: { other: 'Failed to fetch bearer.' } });
  }

  // Fetch child canisters
  let allChildCanisters: [string, string][] = [];
  const action = await dispatch(getAllChildCanisters());
  const state = unwrapResult(action);
  allChildCanisters = state.allChildCanisters;

  if (allChildCanisters.length === 0) {
    rejectWithValue({ error: { other: 'Failed to fetch.' } });
  }

  const childCanisterAndItsOwner = getChildCanisterAndItsOwner(
    allChildCanisters,
    bearer
  );

  if (!childCanisterAndItsOwner) {
    // This token is not on child canister;
    // suppose this token is on someone's wallet.
    return {
      isYours: walletAid === bearer,
      isExhibit: false,
      bearer,
    };
  }

  // This token is on someone's child canister.
  const [childCanisterId, ownerId] = childCanisterAndItsOwner;

  const exhibitId = await fetchExhibitTokenIndex(childCanisterId, tokenId);

  if (!exhibitId) {
    // This token is not exhibited.
    return {
      isYours: userPrincipal === ownerId,
      isExhibit: false,
      bearer,
    };
  }

  // This token is exhibited. Fetch offers.
  const { index: extTokenIndex } = decodeTokenId(exhibitId);
  const actor = createActorCC(childCanisterId);
  const res = await actor.getAuctionByTokenIndex(BigInt(extTokenIndex));
  if ('err' in res) {
    return rejectWithValue({ error: { other: 'Failed to fetch offers.' } });
  }

  let offers: Offer[] = [];
  try {
    offers = await Promise.all(
      res.ok.map(async ([index, owner]) => {
        const res = await actor.getAssetByTokenIndex(index);
        if ('ok' in res) {
          const { tokenId, nftStatus } = getTokenIdAndStatusFromNftStatusCandid(
            res.ok
          );
          return {
            bidTokenIndex: Number(index),
            bidChildCanister: owner.toText(),
            bidChildCanisterAid: principalToAccountIdentifier(
              owner.toText(),
              0
            ),
            tokenId,
            nftStatus,
          };
        } else {
          throw new Error();
        }
      })
    );
  } catch {
    return rejectWithValue({ error: { other: 'Failed to fetch offers.' } });
  }

  return {
    isExhibit: true,
    isYours: userPrincipal === ownerId,
    bearer,
    exhibitId,
    ownerOfExhibitCanister: ownerId,
    offers,
  };
});

export const auctionSlice = createSlice({
  name: 'auction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAuction.fulfilled, (state, action) => {
      state.isExhibit = action.payload?.isExhibit;
      state.isYours = action.payload?.isYours;
      state.bearer = action.payload?.bearer;
      state.exhibitId = action.payload?.exhibitId;
      state.ownerOfExhibitCanister = action.payload?.ownerOfExhibitCanister;
      state.offers = action.payload?.offers;
    });
    builder.addCase(fetchAuction.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const selectIsExhibit = (state: RootState) => state.auction.isExhibit;
export const selectIsYours = (state: RootState) => state.auction.isYours;
export const selectBearer = (state: RootState) => state.auction.bearer;
export const selectExhibitId = (state: RootState) => state.auction.exhibitId;
export const selectOwenerOfExhibitCanister = (state: RootState) =>
  state.auction.ownerOfExhibitCanister;
export const selectError = (state: RootState) => state.auction.error;
export const selectOffers = (state: RootState) => state.auction.offers;

export default auctionSlice.reducer;
