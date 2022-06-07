import React from 'react';
import { Center, Box, Circle, SimpleGrid, Image } from '@chakra-ui/react';
import { useAllExhibitedNftQuery } from './useExhibitedNFTQuery';
import { GENERATIVE_ART_NFT_BASE_URL as baseUrl } from '../../utils/canisterId';
import { NFTCard } from './../../Components/NFTCard';

export const Marketplace = () => {
  const { data } = useAllExhibitedNftQuery();

  return (
    <>
      <Box mt='20px' mx='auto'>
        <Box
          mx='20px'
          borderRadius='lg'
          h={{ base: '32', sm: '40' }}
          bgImage='/generative-art-nft-header.png'
          overflow='hidden'
        />
      </Box>
      <Center pos='relative' pb='100px'>
        <Circle
          pos='absolute'
          top='-60px'
          size='120px'
          bgColor='white'
        ></Circle>
        <Image
          pos='absolute'
          top='-50px'
          height={'100px'}
          alt='Brand logo'
          src={`/brand-logo.svg`}
        />
      </Center>
      <Box maxW='1300px' mx='auto' mt='20px'>
        <SimpleGrid
          mx={{ base: '0px', md: '10px' }}
          spacing='10px'
          columns={{ base: 2, md: 3, lg: 4 }}
        >
          {data && (
            <>
              {data.map((nft) => {
                const { tokenId, tokenIndex, status } = nft;

                return (
                  <Box mx='auto' my='10px' key={tokenIndex}>
                    <NFTCard
                      tokenId={tokenId}
                      status={status}
                      tokenIndex={tokenIndex}
                      baseUrl={baseUrl}
                    />
                  </Box>
                );
              })}
            </>
          )}
        </SimpleGrid>
      </Box>
    </>
  );
};
