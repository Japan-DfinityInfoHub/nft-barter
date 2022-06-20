export const GENERATIVE_ART_NFT_CANISTER_ID =
  process.env.DFX_NETWORK === 'ic' || !process.env.LOCAL_NFT_CANISTER_ID
    ? 'aivvr-hqaaa-aaaap-qamjq-cai'
    : process.env.LOCAL_NFT_CANISTER_ID;

export const GENERATIVE_ART_NFT_BASE_URL =
  process.env.DFX_NETWORK === 'ic' || !process.env.LOCAL_NFT_CANISTER_ID
    ? 'https://aivvr-hqaaa-aaaap-qamjq-cai.raw.ic0.app'
    : `http://${process.env.LOCAL_NFT_CANISTER_ID}.localhost:8000`;
