export const idlFactory = ({ IDL }) => {
  const CanisterIDText = IDL.Text;
  const CanisterIdList = IDL.Record({ 'myExtStandardNft' : CanisterIDText });
  const TokenIndex = IDL.Nat;
  const Error = IDL.Variant({
    'other' : IDL.Text,
    'alreadyRegistered' : IDL.Text,
    'unauthorized' : IDL.Text,
    'notYetRegistered' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const UserId = IDL.Principal;
  const Result_3 = IDL.Variant({ 'ok' : UserId, 'err' : Error });
  const TokenIdentifier = IDL.Text;
  const Nft__1 = IDL.Variant({ 'MyExtStandardNft' : TokenIdentifier });
  const TokenIndex__1 = IDL.Nat;
  const NftStatus = IDL.Variant({
    'BidOffered' : IDL.Record({
      'nft' : Nft__1,
      'from' : CanisterIDText,
      'exhibitNftIndex' : TokenIndex__1,
    }),
    'Stay' : Nft__1,
    'Exhibit' : Nft__1,
    'BidOffering' : IDL.Record({
      'to' : CanisterIDText,
      'nft' : Nft__1,
      'exhibitNftIndex' : TokenIndex__1,
    }),
    'Pending' : IDL.Record({ 'nft' : Nft__1, 'recipient' : CanisterIDText }),
  });
  const Nft = IDL.Variant({ 'MyExtStandardNft' : TokenIdentifier });
  const Result_2 = IDL.Variant({ 'ok' : TokenIndex, 'err' : Error });
  const CanisterIDText__1 = IDL.Text;
  const Result = IDL.Variant({ 'ok' : Nft, 'err' : Error });
  const ChildCanister = IDL.Service({
    'acceptBidOffer' : IDL.Func(
        [IDL.Record({ 'bidToken' : TokenIndex, 'exhibitToken' : TokenIndex })],
        [Result_1],
        [],
      ),
    'exhibitMyNft' : IDL.Func([TokenIndex], [Result_1], []),
    'getAssetOwnerByTokenIndex' : IDL.Func([TokenIndex], [Result_3], ['query']),
    'getAssetOwners' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, UserId))],
        ['query'],
      ),
    'getAssets' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, NftStatus))],
        ['query'],
      ),
    'getAuctions' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(TokenIndex, IDL.Vec(IDL.Tuple(UserId, TokenIndex)))
          ),
        ],
        ['query'],
      ),
    'importMyNft' : IDL.Func([Nft], [Result_2], []),
    'offerBidMyNft' : IDL.Func(
        [
          IDL.Record({
            'exhibitCanisterId' : CanisterIDText__1,
            'bidToken' : TokenIndex,
            'exhibitToken' : TokenIndex,
          }),
        ],
        [Result_1],
        [],
      ),
    'sendToMe' : IDL.Func([TokenIndex], [Result], []),
  });
  return ChildCanister;
};
export const init = ({ IDL }) => {
  const CanisterIDText = IDL.Text;
  const CanisterIdList = IDL.Record({ 'myExtStandardNft' : CanisterIDText });
  return [IDL.Principal, CanisterIdList];
};
