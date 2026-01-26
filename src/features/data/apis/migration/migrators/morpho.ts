import icon from '../../../../../images/platforms/morpho.svg?url';
import type { Abi, Address, Hash } from 'viem';
import { fromWei } from '../../../../../helpers/big-number.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import { selectVaultStrategyAddress } from '../../../selectors/vaults.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { BaseUserData, Migrator, MigratorUnstakeProps } from '../migration-types.ts';
import { isTokenErc20, type TokenErc20 } from '../../../entities/token.ts';
import { buildExecute } from '../utils.ts';

type UserData = BaseUserData & {
  tokens: bigint;
  shares: bigint;
  morphoVault: Address;
  depositToken: TokenErc20;
};

const id = 'morpho';

export const migrator: Migrator<typeof id, UserData> = {
  id,
  name: 'Morpho',
  icon,
  async update({ migrationId, vault, walletAddress, getState }) {
    const state = getState();
    const strategy = selectVaultStrategyAddress(state, vault.id);
    const strategyContract = fetchContract(strategy, MorphoStrategyAbi, vault.chainId);
    const maybeMorphoVault = await Promise.all([
      strategyContract.read.morphoVault().catch(() => undefined),
      strategyContract.read.erc4626().catch(() => undefined),
    ]);
    const morphoVault = maybeMorphoVault.find(a => a !== undefined);
    if (!morphoVault) {
      console.error(migrationId, maybeMorphoVault);
      throw new Error(`${migrationId} could not find morpho vault address`);
    }
    const morphoVaultContract = fetchContract(morphoVault, MorphoMetaAbi, vault.chainId);
    const shares = await morphoVaultContract.read.balanceOf([walletAddress]);
    const tokens = await morphoVaultContract.read.previewRedeem([shares]);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (!isTokenErc20(depositToken)) {
      throw new Error(`${migrationId} only supports ERC20 deposit tokens`);
    }

    return {
      migrationId,
      data: {
        balance: fromWei(tokens, depositToken.decimals),
        symbol: depositToken.symbol,
        shares,
        tokens,
        morphoVault,
        depositToken,
      },
    };
  },
  execute: buildExecute(
    id,
    async ({ walletAddress, walletClient, data: { morphoVault, shares } }) => {
      return async (args: MigratorUnstakeProps): Promise<Hash> => {
        const morphoVaultContract = fetchWalletContract(morphoVault, MorphoMetaAbi, walletClient);
        return morphoVaultContract.write.redeem([shares, walletAddress, walletAddress], args);
      };
    }
  ),
};

const MorphoStrategyAbi = [
  // StrategyMorphoMerkl
  {
    inputs: [],
    name: 'morphoVault',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // StrategyERC4626
  {
    inputs: [],
    name: 'erc4626',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

const MorphoMetaAbi = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }],
    name: 'previewRedeem',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'shares', type: 'uint256' },
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'address', name: 'owner', type: 'address' },
    ],
    name: 'redeem',
    outputs: [{ internalType: 'uint256', name: 'assets', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies Abi;
