export const idlFactory = ({ IDL }) => {
  const UserProfile = IDL.Variant({ 'none' : IDL.Null });
  const Error = IDL.Variant({
    'other' : IDL.Text,
    'alreadyRegistered' : IDL.Text,
    'unauthorized' : IDL.Text,
    'notYetRegistered' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : UserProfile, 'err' : Error });
  const NFTBarter = IDL.Service({
    'getMyProfile' : IDL.Func([], [Result], ['query']),
    'isRegistered' : IDL.Func([], [IDL.Bool], ['query']),
    'mintChildCanister' : IDL.Func([], [IDL.Principal], []),
    'register' : IDL.Func([], [Result], []),
  });
  return NFTBarter;
};
export const init = ({ IDL }) => { return []; };
