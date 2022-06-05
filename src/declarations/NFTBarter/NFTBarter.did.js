export const idlFactory = ({ IDL }) => {
  const CanisterID = IDL.Principal;
  const Error = IDL.Variant({
    'other' : IDL.Text,
    'alreadyRegistered' : IDL.Text,
    'unauthorized' : IDL.Text,
    'notYetRegistered' : IDL.Text,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Vec(CanisterID), 'err' : Error });
  const UserProfile = IDL.Variant({ 'none' : IDL.Null });
  const Result_1 = IDL.Variant({ 'ok' : UserProfile, 'err' : Error });
  const Result = IDL.Variant({ 'ok' : CanisterID, 'err' : Error });
  const NFTBarter = IDL.Service({
    'getMyChildCanisters' : IDL.Func([], [Result_2], ['query']),
    'getMyProfile' : IDL.Func([], [Result_1], ['query']),
    'getTargetNftCanisterId' : IDL.Func([], [CanisterID], ['query']),
    'isRegistered' : IDL.Func([], [IDL.Bool], ['query']),
    'mintChildCanister' : IDL.Func([], [Result], []),
    'register' : IDL.Func([], [Result_1], []),
    'updateTargetNftCanisterId' : IDL.Func([CanisterID], [Result], []),
  });
  return NFTBarter;
};
export const init = ({ IDL }) => { return []; };
