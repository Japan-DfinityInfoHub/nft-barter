export const idlFactory = ({ IDL }) => {
  const UserId__1 = IDL.Principal;
  const DefiniteUser = IDL.Record({ 'id' : UserId__1, 'name' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : DefiniteUser, 'err' : IDL.Text });
  const UserId = IDL.Principal;
  const Result = IDL.Variant({ 'ok' : UserId, 'err' : IDL.Text });
  const NFTBarter = IDL.Service({
    'getMyInfo' : IDL.Func([], [Result_1], ['query']),
    'isRegistered' : IDL.Func([], [IDL.Bool], ['query']),
    'register' : IDL.Func([], [Result], []),
  });
  return NFTBarter;
};
export const init = ({ IDL }) => { return []; };
