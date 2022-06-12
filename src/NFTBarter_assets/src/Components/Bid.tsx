import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { decodeTokenId, generateTokenIdentifier } from '../utils/ext';
import { createActor } from '../../../declarations/ChildCanister';

import { NotFound } from './NotFound';

export const Bid = () => {
  // `exhibitId` is constructed by canister ID of exhibit child canister and token index,
  // in the same manner as an EXT token identifier.
  const { exhibitId } = useParams();
  const { index, canisterId } = decodeTokenId(exhibitId);

  if (canisterId === '') {
    return <NotFound />;
  }

  const fetchAuction = async () => {
    const actor = createActor(canisterId);
    const tid = generateTokenIdentifier(canisterId, index);
  };

  useEffect(() => {
    fetchAuction();
  }, []);

  return <div>Bid</div>;
};
