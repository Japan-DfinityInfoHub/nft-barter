import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  fetchAuction,
  selectBearer,
  selectIsYours,
  selectExhibitId,
  selectIsExhibit,
  selectError,
} from './auctionSlice';

export const useAuction = (tokenId: string) => {
  const dispatch = useAppDispatch();

  const bearer = useAppSelector(selectBearer);
  const isYours = useAppSelector(selectIsYours);
  const exhibitId = useAppSelector(selectExhibitId);
  const isExhibit = useAppSelector(selectIsExhibit);
  const error = useAppSelector(selectError);

  useEffect(() => {
    dispatch(fetchAuction({ tokenId }));
  }, [tokenId]);

  return {
    bearer,
    isExhibit,
    isYours,
    exhibitId,
    error,
  };
};
