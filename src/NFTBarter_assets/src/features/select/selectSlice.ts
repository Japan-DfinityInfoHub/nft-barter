import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';
import { RootState, AsyncThunkConfig } from '../../app/store';

// Slices
import { selectOffer } from '../auction/auctionSlice';

// Declarations
import { Error } from '../../../../declarations/ChildCanister/ChildCanister.did.js';
import { createActor } from '../../../../declarations/ChildCanister';

export interface SelectState {
  error?: Error;
}

const initialState: SelectState = {};

export const handleClickSelect = createAsyncThunk<
  SelectState,
  {
    exhibitCanisterId: string;
    selectedTokenIndex: number;
    exhibitTokenIndex: number;
  },
  AsyncThunkConfig<{ error: Error }>
>(
  'select/handleClickSelect',
  async (
    { exhibitCanisterId, selectedTokenIndex, exhibitTokenIndex },
    { rejectWithValue, dispatch }
  ) => {
    const authClient = await AuthClient.create();

    if (!authClient || !authClient.isAuthenticated()) {
      return rejectWithValue({
        error: { unauthorized: 'Failed to use auth client.' },
      });
    }

    const identity = await authClient.getIdentity();

    const actor = createActor(exhibitCanisterId, {
      agentOptions: { identity },
    });

    const res = await actor.selectTokenInAuction({
      selectedTokenIndex: BigInt(selectedTokenIndex),
      exhibitTokenIndex: BigInt(exhibitTokenIndex),
    });
    if ('err' in res) {
      return rejectWithValue({ error: res.err });
    }

    // Change nft status of offers
    dispatch(selectOffer(selectedTokenIndex));

    return {};
  }
);

export const selectSlice = createSlice({
  name: 'select',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(handleClickSelect.rejected, (state, action) => {
      state.error = action.payload?.error;
    });
  },
});

export const selectError = (state: RootState) => state.select.error;

export default selectSlice.reducer;
