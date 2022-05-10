import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthClient } from '@dfinity/auth-client';

import { RootState } from '../../app/store';

const DAYS = BigInt(1);
const HOURSPERDAY = BigInt(24);
const NANOSECONDSPERHOUR = BigInt(3600000000000);

export interface AuthState {
  isLogin: boolean;
  principal?: string;
}

const initialState: AuthState = {
  isLogin: false,
};

const promisedLogin = (authClient: AuthClient) =>
  new Promise<AuthState>(async (resolve, reject) => {
    try {
      await authClient.login({
        onSuccess: async () => {
          const identity = await authClient.getIdentity();
          const isAnonymous = identity.getPrincipal().isAnonymous();
          if (!isAnonymous && (await authClient.isAuthenticated())) {
            resolve({
              isLogin: true,
              principal: identity.getPrincipal().toText(),
            });
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

export const checkAuth = createAsyncThunk('auth/isAuth', async () => {
  const authClient = await AuthClient.create();
  if (await authClient.isAuthenticated()) {
    const identity = authClient.getIdentity();
    return { isLogin: true, principal: identity.getPrincipal().toText() };
  } else {
    return { isLogin: false };
  }
});

export const login = createAsyncThunk('auth/login', async () => {
  const authClient = await AuthClient.create();

  if (!authClient) {
    throw new Error('Failed to use auth client.');
  }
  return promisedLogin(authClient);
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
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isLogin = action.payload.isLogin;
      state.principal = action.payload.principal;
    });
  },
});

export const { logout } = authSlice.actions;

export const selectIsLogin = (state: RootState) => state.auth.isLogin;
export const selectPrincipal = (state: RootState) => state.auth.principal;

export default authSlice.reducer;
