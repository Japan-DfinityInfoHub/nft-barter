export const idlFactory = ({ IDL }) => {
  const UserProfile = IDL.Variant({ 'none' : IDL.Null });
  const Result = IDL.Variant({ 'ok' : UserProfile, 'err' : IDL.Text });
  const NFTBarter = IDL.Service({
    'getMyProfile' : IDL.Func([], [Result], ['query']),
    'isRegistered' : IDL.Func([], [IDL.Bool], ['query']),
    'register' : IDL.Func([], [Result], []),
  });
  return NFTBarter;
};
export const init = ({ IDL }) => { return []; };
