import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

import { RootState, AsyncThunkConfig } from '../../app/store';
import { createNFTBarterActor } from '../../utils/createNFTBarterActor';
import {
  UserProfile,
  Result,
} from '../../../../declarations/NFTBarter/NFTBarter.did';

const DAYS = BigInt(1);
const HOURSPERDAY = BigInt(24);
const NANOSECONDSPERHOUR = BigInt(3600000000000);

export interface AuthState {
  isLogin: boolean;
  principal?: string;
  userProfile?: UserProfile;
  errorMessage?: string;
}

const initialState: AuthState = {
  isLogin: false,
};

const getMyProfile = async (identity: Identity) => {
  const actor = createNFTBarterActor({ agentOptions: { identity } });
  return await actor.getMyProfile();
};

const promisedLogin = (authClient: AuthClient) =>
  new Promise<{ res: Result; principal: string }>(async (resolve, reject) => {
    try {
      await authClient.login({
        onSuccess: async () => {
          const identity = await authClient.getIdentity();
          const isAnonymous = identity.getPrincipal().isAnonymous();
          if (!isAnonymous && (await authClient.isAuthenticated())) {
            const actor = createNFTBarterActor({ agentOptions: { identity } });
            const isRegistered = await actor.isRegistered();

            // Return `{ res: Result; principal: string }` here because
            // `UserProfile` currently does not contain principal id.
            // We may add `id: Principal` to `UserProfile` in the backend canister
            // so that this function can simply return `Result`.
            if (!isRegistered) {
              resolve({
                res: await actor.register(),
                principal: identity.getPrincipal().toText(),
              });
            } else {
              resolve({
                res: await getMyProfile(identity),
                principal: identity.getPrincipal().toText(),
              });
            }
          }
        },
        identityProvider:
          process.env.DFX_NETWORK === 'ic'
            ? 'https://identity.ic0.app/#authorize'
            : process.env.LOCAL_II_CANISTER,
        // Authorization expires in 1 day
        maxTimeToLive: DAYS * HOURSPERDAY * NANOSECONDSPERHOUR,
      });
    } catch (e) {
      reject(e);
    }
  });

export const checkAuth = createAsyncThunk<
  AuthState,
  undefined,
  AsyncThunkConfig<{ errorMessage: string }>
>('auth/isAuth', async (_, { rejectWithValue }) => {
  const authClient = await AuthClient.create();
  if (await authClient.isAuthenticated()) {
    const identity = authClient.getIdentity();
    const res = await getMyProfile(identity);
    if ('ok' in res) {
      return {
        isLogin: true,
        principal: identity.getPrincipal().toText(),
        userProfile: res.ok,
      };
    } else {
      return rejectWithValue({ errorMessage: res.err });
    }
  } else {
    return { isLogin: false };
  }
});

export const login = createAsyncThunk<
  AuthState,
  undefined,
  AsyncThunkConfig<{ errorMessage: string }>
>('auth/login', async (_, { rejectWithValue }) => {
  const authClient = await AuthClient.create();

  if (!authClient) {
    throw new Error('Failed to use auth client.');
  }
  const { res, principal } = await promisedLogin(authClient);
  if ('ok' in res) {
    return {
      isLogin: true,
      principal,
    };
  } else {
    return rejectWithValue({ errorMessage: res.err });
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isLogin = false;
      state.principal = undefined;
      localStorage.removeItem('ic-identity');
      localStorage.removeItem('ic-delegation');
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLogin = action.payload.isLogin;
      state.principal = action.payload.principal;
      state.userProfile = action.payload.userProfile;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.errorMessage = action.payload?.errorMessage;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isLogin = action.payload.isLogin;
      state.principal = action.payload.principal;
      state.userProfile = action.payload.userProfile;
    });
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.errorMessage = action.payload?.errorMessage;
    });
  },
});

export const { logout } = authSlice.actions;

export const selectIsLogin = (state: RootState) => state.auth.isLogin;
export const selectPrincipal = (state: RootState) => state.auth.principal;
export const selectUserProfile = (state: RootState) => state.auth.userProfile;
export const selectErrorMessage = (state: RootState) => state.auth.errorMessage;

export default authSlice.reducer;
