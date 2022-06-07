import { useQuery } from 'react-query';
import { fetchAllExhibitedNft } from '../../utils/nft';

export const useAllExhibitedNftQuery = () => {
  return useQuery('allExhibitedNfts', fetchAllExhibitedNft);
};
