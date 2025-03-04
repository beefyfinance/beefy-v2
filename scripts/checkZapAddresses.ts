import { appToAddressBookId } from './common/config.ts';
import { loadJson } from './common/files.ts';
import { type AppChainId } from './common/chains.ts';
import { addressBook } from 'blockchain-addressbook';
import { getViemClient } from './common/viem.ts';
import { type Abi, type Address, checksumAddress, getContract } from 'viem';

type Zap = {
  chainId: AppChainId;
  router: string;
  manager: string;
};

async function checkZap(zap: Zap): Promise<Zap> {
  const viemClient = getViemClient(zap.chainId);
  const router = getContract({
    abi: [
      {
        type: 'function',
        name: 'tokenManager',
        constant: true,
        stateMutability: 'view',
        payable: false,
        inputs: [],
        outputs: [{ type: 'address', name: 'tokenManager' }],
      },
      {
        type: 'function',
        name: 'owner',
        constant: true,
        stateMutability: 'view',
        payable: false,
        inputs: [],
        outputs: [{ type: 'address', name: 'owner' }],
      },
    ] as const satisfies Abi,
    address: zap.router as Address,
    client: viemClient,
  });

  const manager = getContract({
    abi: [
      {
        type: 'function',
        name: 'zap',
        constant: true,
        stateMutability: 'view',
        payable: false,
        inputs: [],
        outputs: [{ type: 'address', name: 'zap' }],
      },
    ] as const satisfies Abi,
    address: zap.manager as Address,
    client: viemClient,
  });
  const abChain = appToAddressBookId(zap.chainId);

  const [tokenManagerAddress, routerOwnerAddress, routerAddress] = await Promise.all([
    router.read.tokenManager(),
    router.read.owner(),
    manager.read.zap(),
  ]);

  const checksummedConfigRouter = checksumAddress(zap.router as Address);
  const checksummedConfigManager = checksumAddress(zap.manager as Address);
  const checksummedContractRouter = checksumAddress(routerAddress);
  const checksummedContractManager = checksumAddress(tokenManagerAddress);
  const checksummedContractOwner = checksumAddress(routerOwnerAddress);
  let errors = 0;

  if (checksummedConfigRouter !== checksummedContractRouter) {
    ++errors;
    console.error(
      `Router mismatch: ${zap.chainId} ${checksummedConfigRouter} != ${checksummedContractRouter}`
    );
  } else if (zap.router !== checksummedConfigRouter) {
    ++errors;
    console.error(
      `Router not checksummed: ${zap.chainId} ${zap.router} != ${checksummedConfigRouter}`
    );
  }

  if (checksummedConfigManager !== checksummedContractManager) {
    ++errors;
    console.error(
      `Manager mismatch: ${zap.chainId} ${checksummedConfigManager} != ${checksummedContractManager}`
    );
  } else if (zap.manager !== checksummedConfigManager) {
    ++errors;
    console.error(
      `Manager not checksummed: ${zap.chainId} ${zap.manager} != ${checksummedConfigManager}`
    );
  }

  if (checksummedContractOwner !== addressBook[abChain].platforms.beefyfinance.keeper) {
    ++errors;
    console.error(
      `Owner not keeper: ${zap.chainId} ${checksummedContractOwner} != ${addressBook[abChain].platforms.beefyfinance.keeper}`
    );
  }

  if (errors > 0) {
    throw new Error(`Zap check failed for ${zap.chainId}`);
  }

  return {
    ...zap,
    router: checksummedContractRouter,
    manager: checksummedContractManager,
  };
}

async function start() {
  const existing = await loadJson<Zap[]>('./src/config/zap/zaps.json');
  const checked = await Promise.allSettled(existing.map(checkZap));
  const failed = checked.filter(c => c.status === 'rejected');
  if (failed.length > 0) {
    throw new Error(`Some zap checks failed`);
  }
}

start().catch(e => {
  console.error(e);
  process.exit(1);
});
