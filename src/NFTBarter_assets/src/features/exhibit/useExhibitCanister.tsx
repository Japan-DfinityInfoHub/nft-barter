import { useState, useEffect } from 'react';
import { useChildCanistersQuery } from '../childCanister/useChildCanistersQuery';
import { createActor as createActorNFT } from '../../../../declarations/GenerativeArtNFT';
import { decodeTokenId, principalToAccountIdentifier } from '../../utils/ext';
import {
  CanisterID,
  UserId,
} from '../../../../declarations/NFTBarter/NFTBarter.did';

type AccountIdentifier = string;
type Props = {
  tokenId: string;
};

export const useExhibitCanister = ({ tokenId }: Props) => {
  const { canisterId } = decodeTokenId(tokenId);

  const { data, isFetched } = useChildCanistersQuery();
  const [bearer, setBearer] = useState<AccountIdentifier>('');
  const [exhibitCanisterAndItsOwner, setExhibitCanisterAndItsOwner] =
    useState<[string, string]>();

  const fetchBearer = async () => {
    const actor = createActorNFT(canisterId);
    const res = await actor.bearer(tokenId);
    if ('ok' in res) {
      const aid = res.ok;
      setBearer(aid);
    }
  };

  const getExhibitCanister = (
    data: [CanisterID, UserId][],
    ownerAid: string
  ) => {
    return data.find(([canisterId, _]) => {
      const aid = principalToAccountIdentifier(canisterId.toText(), 0);
      return aid == ownerAid;
    });
  };

  useEffect(() => {
    fetchBearer();
  }, []);

  useEffect(() => {
    if (bearer === '' || !isFetched || data === undefined) {
      return;
    }
    const res = getExhibitCanister(data, bearer);
    if (res !== undefined) {
      setExhibitCanisterAndItsOwner([res[0].toText(), res[1].toText()]);
    }
  }, [bearer, isFetched]);

  return {
    bearer,
    exhibitCanisterAndItsOwner,
  };
};
