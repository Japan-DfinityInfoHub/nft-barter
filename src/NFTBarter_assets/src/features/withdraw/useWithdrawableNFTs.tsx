import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  fetchWithdrawableNfts,
  selectWithdrawableNfts,
} from '../nfts/nftsSlice';

export const useWithdrawableNfTs = () => {
  const dispatch = useAppDispatch();

  const withdrawableNfts = useAppSelector(selectWithdrawableNfts);

  useEffect(() => {
    dispatch(fetchWithdrawableNfts());
  }, []);

  return {
    withdrawableNfts,
  };
};
