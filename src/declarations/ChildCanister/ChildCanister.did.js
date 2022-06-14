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
  const Result_2 = IDL.Variant({ 'ok' : TokenIndex, 'err' : Error });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const TokenIdentifier = IDL.Text;
  const Nft__1 = IDL.Variant({ 'MyExtStandardNft' : TokenIdentifier });
  const TokenIndex__1 = IDL.Nat;
  const NftStatus = IDL.Variant({
    'BidOffered' : IDL.Record({
      'nft' : Nft__1,
      'tokenIndexOnBidCanister' : TokenIndex__1,
      'from' : CanisterIDText,
      'exhibitNftIndex' : TokenIndex__1,
    }),
    'Stay' : Nft__1,
    'Exhibit' : Nft__1,
    'Selected' : Nft__1,
    'Winning' : IDL.Record({
      'nft' : Nft__1,
      'winningTokenIndex' : TokenIndex__1,
      'winningNft' : Nft__1,
      'canisterId' : CanisterIDText,
    }),
    'NotSelected' : IDL.Record({
      'nft' : Nft__1,
      'recipient' : CanisterIDText,
    }),
    'ExhibitEnd' : IDL.Record({ 'nft' : Nft__1, 'recipient' : CanisterIDText }),
    'BidOffering' : IDL.Record({
      'to' : CanisterIDText,
      'nft' : Nft__1,
      'tokenIndexOnExhibitCanister' : TokenIndex__1,
      'exhibitNftIndex' : TokenIndex__1,
    }),
    'Pending' : IDL.Record({ 'nft' : Nft__1, 'recipient' : CanisterIDText }),
  });
  const Result_5 = IDL.Variant({ 'ok' : NftStatus, 'err' : Error });
  const UserId = IDL.Principal;
  const Result_4 = IDL.Variant({ 'ok' : UserId, 'err' : Error });
  const Result_3 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(TokenIndex, UserId)),
    'err' : Error,
  });
  const Nft = IDL.Variant({ 'MyExtStandardNft' : TokenIdentifier });
  const CanisterIDText__1 = IDL.Text;
  const Result = IDL.Variant({ 'ok' : Nft, 'err' : Error });
  const ChildCanister = IDL.Service({
    'acceptBidOffer' : IDL.Func(
        [IDL.Record({ 'bidToken' : TokenIndex, 'exhibitToken' : TokenIndex })],
        [Result_2],
        [],
      ),
    'exhibitMyNft' : IDL.Func([TokenIndex], [Result_1], []),
    'getAssetByTokenIndex' : IDL.Func([TokenIndex], [Result_5], ['query']),
    'getAssetOwnerByTokenIndex' : IDL.Func([TokenIndex], [Result_4], ['query']),
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
    'getAuctionByTokenIndex' : IDL.Func([TokenIndex], [Result_3], ['query']),
    'getAuctions' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(TokenIndex, IDL.Vec(IDL.Tuple(TokenIndex, UserId)))
          ),
        ],
        ['query'],
      ),
    'importMyNft' : IDL.Func([Nft], [Result_2], []),
    'notifyWinner' : IDL.Func(
        [
          IDL.Record({
            'bidTokenIndex' : TokenIndex,
            'exhibitTokenIndex' : TokenIndex,
            'winningNft' : Nft,
          }),
        ],
        [Result_1],
        [],
      ),
    'offerBidMyNft' : IDL.Func(
        [
          IDL.Record({
            'exhibitCanisterId' : CanisterIDText__1,
            'bidToken' : TokenIndex,
            'exhibitToken' : TokenIndex,
          }),
        ],
        [Result_2],
        [],
      ),
    'selectTokenInAuction' : IDL.Func(
        [
          IDL.Record({
            'selectedTokenIndex' : TokenIndex,
            'exhibitTokenIndex' : TokenIndex,
          }),
        ],
        [Result_1],
        [],
      ),
    'sendToMe' : IDL.Func([TokenIndex], [Result], []),
    'withdrawNft' : IDL.Func([TokenIndex], [Result], []),
  });
  return ChildCanister;
};
export const init = ({ IDL }) => {
  const CanisterIDText = IDL.Text;
  const CanisterIdList = IDL.Record({ 'myExtStandardNft' : CanisterIDText });
  return [IDL.Principal, CanisterIdList];
};
