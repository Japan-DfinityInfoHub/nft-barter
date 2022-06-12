import { useState, useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';

import { useChildCanistersQuery } from '../childCanister/useChildCanistersQuery';
import { createActor as createActorNFT } from '../../../../declarations/GenerativeArtNFT';
import { createActor as createActorCC } from '../../../../declarations/ChildCanister';

import {
  decodeTokenId,
  principalToAccountIdentifier,
  generateTokenIdentifier,
} from '../../utils/ext';
import { getTokenIdAndNftStatusFromAsset } from '../../utils/nft';
import {
  CanisterID,
  UserId,
} from '../../../../declarations/NFTBarter/NFTBarter.did';
import { selectPrincipal, selectAccountId } from '../auth/authSlice';

type AccountIdentifier = string;
type Props = {
  tokenId: string;
};

export const useExhibitCanister = ({ tokenId }: Props) => {
  const { canisterId } = decodeTokenId(tokenId);

  const userPrincipal = useAppSelector(selectPrincipal);
  const walletAid = useAppSelector(selectAccountId);

  const { data, isFetched } = useChildCanistersQuery();
  const [bearer, setBearer] = useState<AccountIdentifier>('');
  const [exhibitCanisterAndItsOwner, setExhibitCanisterAndItsOwner] =
    useState<[string, string]>();
  const [isExhibit, setIsExhibit] = useState(false);
  const [isYours, setIsYours] = useState(false);
  const [exhibitId, setExhibitId] = useState('');

  const fetchBearer = async () => {
    const actor = createActorNFT(canisterId);
    const res = await actor.bearer(tokenId);
    if ('ok' in res) {
      const aid = res.ok;
      setBearer(aid);
    }
  };

  const fetchExhibitTokenIndex = async (canisterId: string) => {
    const actor = createActorCC(canisterId);
    const assets = await actor.getAssets();
    const res = assets
      .map((asset) => getTokenIdAndNftStatusFromAsset(asset))
      .find((nft) => nft.tokenId === tokenId);
    if (!res) {
      return;
    }
    const { tokenIndexOnChildCanister } = res;
    const exhibitId = generateTokenIdentifier(
      canisterId,
      tokenIndexOnChildCanister
    );
    setExhibitId(exhibitId);
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
    if (res === undefined) {
      return;
    }

    const canisterId = res[0].toText();
    const ownerId = res[1].toText();
    setExhibitCanisterAndItsOwner([canisterId, ownerId]);
    fetchExhibitTokenIndex(canisterId);
    setIsExhibit(true);
  }, [bearer, isFetched]);

  useEffect(() => {
    // Non exhibit
    if (!walletAid || !bearer) {
      return;
    }
    if (walletAid === bearer) {
      setIsYours(true);
    }

    // Exhibit
    if (!userPrincipal || !exhibitCanisterAndItsOwner) {
      return;
    }
    const owener = exhibitCanisterAndItsOwner[1];
    setIsYours(userPrincipal === owener);
  }, [userPrincipal, exhibitCanisterAndItsOwner, walletAid, bearer]);

  return {
    bearer,
    exhibitCanisterAndItsOwner,
    isExhibit,
    isYours,
    exhibitId,
  };
};
