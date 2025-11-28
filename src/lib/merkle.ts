import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { solidityKeccak256 } from 'viem';
import whitelist from './whitelist.json';

type WhitelistEntry = {
  address: `0x${string}`;
  amount: string;
};

const leaves = whitelist.map((entry: WhitelistEntry) => 
  Buffer.from(
    solidityKeccak256(
      ['address', 'uint256'],
      [entry.address, BigInt(entry.amount)]
    ).slice(2),
    'hex'
  )
);

const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

export const getMerkleRoot = (): `0x${string}` => {
  return `0x${merkleTree.getRoot().toString('hex')}`;
};

export const getAllocationForAddress = (address: `0x${string}`): { proof: `0x${string}`[], amount: string } | null => {
  const entry = whitelist.find((item: WhitelistEntry) => item.address.toLowerCase() === address.toLowerCase());
  if (!entry) {
    return null;
  }

  const leaf = Buffer.from(
    solidityKeccak256(
      ['address', 'uint256'],
      [entry.address, BigInt(entry.amount)]
    ).slice(2),
    'hex'
  );

  const proof = merkleTree.getHexProof(leaf).map(p => p as `0x${string}`);
  
  return {
    proof,
    amount: entry.amount
  };
};
