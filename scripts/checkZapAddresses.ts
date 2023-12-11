import { appToAddressBookId, chainRpcs } from './common/config';
import { loadJson } from './common/utils';
import { AppChainId } from './common/chains';
import { MultiCall } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';

type Zap = {
  chainId: AppChainId;
  router: string;
  manager: string;
};

async function checkZap(zap: Zap): Promise<Zap> {
  const abChain = appToAddressBookId(zap.chainId);
  const web3 = new Web3(chainRpcs[abChain]);
  const multicall = new MultiCall(web3, addressBook[abChain].platforms.beefyfinance.multicall);
  const router = new web3.eth.Contract(
    [
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
    ],
    zap.router
  );

  const manager = new web3.eth.Contract(
    [
      {
        type: 'function',
        name: 'zap',
        constant: true,
        stateMutability: 'view',
        payable: false,
        inputs: [],
        outputs: [{ type: 'address', name: 'zap' }],
      },
    ],
    zap.manager
  );

  const [[{ tokenManagerAddress, routerOwnerAddress }], [{ routerAddress }]] = await multicall.all([
    [
      {
        tokenManagerAddress: router.methods.tokenManager(),
        routerOwnerAddress: router.methods.owner(),
      },
    ],
    [{ routerAddress: manager.methods.zap() }],
  ]);

  const checksummedConfigRouter = web3.utils.toChecksumAddress(zap.router);
  const checksummedConfigManager = web3.utils.toChecksumAddress(zap.manager);
  const checksummedContractRouter = web3.utils.toChecksumAddress(routerAddress);
  const checksummedContractManager = web3.utils.toChecksumAddress(tokenManagerAddress);
  const checksummedContractOwner = web3.utils.toChecksumAddress(routerOwnerAddress);
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
