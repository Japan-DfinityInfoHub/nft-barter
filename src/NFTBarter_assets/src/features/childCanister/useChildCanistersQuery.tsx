import { useQuery } from 'react-query';
import { fetchAllChildCanisters } from '../../utils/nft';

export const useChildCanistersQuery = () => {
  return useQuery('allChildCanisters', fetchAllChildCanisters);
};
