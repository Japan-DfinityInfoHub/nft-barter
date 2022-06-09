export const idlFactory = ({ IDL }) => {
  const CanisterIdList = IDL.Record({ 'myExtStandardNft' : IDL.Text });
  const Error = IDL.Variant({
    'other' : IDL.Text,
    'alreadyRegistered' : IDL.Text,
    'unauthorized' : IDL.Text,
    'notYetRegistered' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const UserId = IDL.Principal;
  const TokenIdentifier = IDL.Text;
  const Nft__1 = IDL.Variant({ 'MyExtStandardNft' : TokenIdentifier });
  const NftStatus = IDL.Variant({
    'Bid' : Nft__1,
    'Stay' : Nft__1,
    'Exhibit' : Nft__1,
  });
  const Nft = IDL.Variant({ 'MyExtStandardNft' : TokenIdentifier });
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : Error });
  const ChildCanister = IDL.Service({
    'exhibitMyNft' : IDL.Func([IDL.Nat], [Result_1], []),
    'getAssetOwners' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, UserId))],
        ['query'],
      ),
    'getAssets' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, NftStatus))],
        ['query'],
      ),
    'getAuctions' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Vec(IDL.Tuple(UserId, IDL.Nat))))],
        ['query'],
      ),
    'importMyNft' : IDL.Func([Nft], [Result], []),
  });
  return ChildCanister;
};
export const init = ({ IDL }) => {
  const CanisterIdList = IDL.Record({ 'myExtStandardNft' : IDL.Text });
  return [IDL.Principal, CanisterIdList];
};
