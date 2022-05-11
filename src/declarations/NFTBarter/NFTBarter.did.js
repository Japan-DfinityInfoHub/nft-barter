export const idlFactory = ({ IDL }) => {
  const UserProfile = IDL.Variant({ 'none' : IDL.Null });
  const Result_1 = IDL.Variant({ 'ok' : UserProfile, 'err' : IDL.Text });
  const UserId = IDL.Principal;
  const Result = IDL.Variant({ 'ok' : UserId, 'err' : IDL.Text });
  const NFTBarter = IDL.Service({
    'getMyProfile' : IDL.Func([], [Result_1], ['query']),
    'isRegistered' : IDL.Func([], [IDL.Bool], ['query']),
    'register' : IDL.Func([], [Result], []),
  });
  return NFTBarter;
};
export const init = ({ IDL }) => { return []; };
