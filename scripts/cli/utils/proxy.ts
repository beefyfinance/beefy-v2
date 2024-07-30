import {
  Address,
  decodeAbiParameters,
  getAddress,
  Hash,
  Hex,
  keccak256,
  PublicClient,
  toBytes,
  toHex,
} from 'viem';
import type { ByteArray } from 'viem/types/misc';

const EMPTY_STORAGE_SLOT: Hex =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
const EMPTY_ADDRESS: Address = '0x0000000000000000000000000000000000000000';
const EIP1967_BEACON_SLOT = toEip1967Hash('eip1967.proxy.beacon');

export async function getBeaconAddress(
  client: PublicClient,
  beaconProxyAddress: Address
): Promise<Address> {
  const storage = await client.getStorageAt({
    address: beaconProxyAddress,
    slot: EIP1967_BEACON_SLOT,
  });

  if (!storage || isEmptyStorageSlot(storage)) {
    throw new Error(`No beacon address found at EIP1967_BEACON_SLOT on ${beaconProxyAddress}`);
  }

  const beaconAddress = bytesToAddress(storage);
  if (!beaconAddress || isEmptyAddress(beaconAddress)) {
    throw new Error(
      `Invalid beacon address "${beaconAddress}" found at EIP1967_BEACON_SLOT on ${beaconProxyAddress}`
    );
  }

  return beaconAddress;
}

export async function getBeaconImplementationAddress(
  client: PublicClient,
  beaconAddress: Address
): Promise<Address> {
  const implementationAddress = await client.readContract({
    address: beaconAddress,
    functionName: 'implementation',
    abi: [
      {
        inputs: [],
        name: 'implementation',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
  });

  if (!implementationAddress || isEmptyAddress(implementationAddress)) {
    throw new Error(`No implementation address found on ${beaconAddress}`);
  }

  return implementationAddress;
}

export async function getBeaconProxyImplementationAddress(
  client: PublicClient,
  beaconProxyAddress: Address
): Promise<Address> {
  const beaconAddress = await getBeaconAddress(client, beaconProxyAddress);
  return getBeaconImplementationAddress(client, beaconAddress);
}

export function bytesToAddress(bytes: ByteArray | Hex): Address {
  return decodeAbiParameters([{ type: 'address' }], bytes)[0];
}

export function isEmptyAddress(address: Address): boolean {
  return address === EMPTY_ADDRESS;
}

export function isEmptyStorageSlot(slot: Hex): boolean {
  return slot === EMPTY_STORAGE_SLOT;
}

export function toEip1967Hash(label: string): Hash {
  const hash = keccak256(toBytes(label));
  return toHex(BigInt(hash) - 1n);
}
