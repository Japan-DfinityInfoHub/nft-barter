import { toHexString } from '@dfinity/candid/lib/cjs/utils/buffer';
import { Principal } from '@dfinity/principal';

export type TokenProps = {
  index: number;
  canisterId: string;
};

export const generateTokenIdentifier = (
  principal: string,
  index: number
): string => {
  const padding = Buffer.from('\x0Atid');
  const array = new Uint8Array([
    ...padding,
    ...Principal.fromText(principal).toUint8Array(),
    ...numberTo32bits(index),
  ]);
  return Principal.fromUint8Array(array).toText();
};

export const getSubAccount = (index: number): number[] => {
  return Array(28).fill(0).concat(numberTo32bits(index));
};

export const decodeTokenId = (tid: string | undefined): TokenProps => {
  if (!tid || !checkIfTextIsPrincipal(tid)) {
    return { index: 0, canisterId: '' };
  }

  const array = [...Principal.fromText(tid).toUint8Array()];
  const padding = new Uint8Array(array.splice(0, 4));
  if (toHexString(padding) !== toHexString(Buffer.from('\x0Atid'))) {
    return { index: 0, canisterId: tid };
  } else {
    const index = numberFrom32bits(array.splice(-4));
    const canisterId = Principal.fromUint8Array(new Uint8Array(array)).toText();
    return { index, canisterId };
  }
};

const checkIfTextIsPrincipal = (text: string): boolean => {
  try {
    Principal.fromText(text);
    return true;
  } catch (e) {
    return false;
  }
};

const numberTo32bits = (num: number) => {
  let b = new ArrayBuffer(4);
  new DataView(b).setUint32(0, num);
  return Array.from(new Uint8Array(b));
};

const numberFrom32bits = (array: number[]): number => {
  return array.reduce((acc, a) => (acc << 256) | a);
};
