export const GENERATIVE_ART_NFT_CANISTER_ID =
  process.env.DFX_NETWORK === 'ic' || !process.env.LOCAL_NFT_CANISTER_ID
    ? 'REPLACE_TO_CANISTER_ID'
    : process.env.LOCAL_NFT_CANISTER_ID;
