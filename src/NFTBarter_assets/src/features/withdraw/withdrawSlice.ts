import { createSlice, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { RootState, AsyncThunkConfig } from '../../app/store';

import { Nft } from '../../models/NftModel';
import { isWithdrawable } from '../../utils/nft';

// Slices
import { fetchNFTsOnChildCanister } from '../nfts/nftsSlice';

export interface WithdrawState {
  withdrawableNfts: Nft[];
  error?: string;
}

const initialState: WithdrawState = {
  withdrawableNfts: [],
};

export const fetchAll = createAsyncThunk<
  { withdrawableNfts: Nft[] },
  undefined,
  AsyncThunkConfig<{ error: string }>
>('withdraw/fetchAll', async (_, { dispatch }) => {
  const action = await dispatch(fetchNFTsOnChildCanister());
  const state = unwrapResult(action);
  const nftsOnMyChildCanisters = state.nftsOnMyChildCanisters;

  const withdrawableNfts = nftsOnMyChildCanisters.filter((nft) => {
    const { status } = nft;
    return isWithdrawable(status);
  });

  return { withdrawableNfts };
});

export const withdrawSlice = createSlice({
  name: 'withdraw',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAll.fulfilled, (state, action) => {
      state.withdrawableNfts = action.payload?.withdrawableNfts;
    });
  },
});

export const selectError = (state: RootState) => state.withdraw.error;

export default withdrawSlice.reducer;
