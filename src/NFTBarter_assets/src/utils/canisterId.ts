export const GENERATIVE_ART_NFT_CANISTER_ID =
  process.env.DFX_NETWORK === 'ic' || !process.env.LOCAL_NFT_CANISTER_ID
    ? 'REPLACE_TO_CANISTER_ID'
    : process.env.LOCAL_NFT_CANISTER_ID;

export const GENERATIVE_ART_NFT_BASE_URL =
  process.env.DFX_NETWORK === 'ic' || !process.env.LOCAL_NFT_CANISTER_ID
    ? 'http://REPLACE_TO_CANISTER_ID.ic0.app'
    : `http://${process.env.LOCAL_NFT_CANISTER_ID}.localhost:8000`;
