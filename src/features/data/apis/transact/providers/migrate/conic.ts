import { BaseMigrateProvider } from './base';
import type { VaultEntity } from '../../../../entities/vault';
import type { BeefyState } from '../../../../../../redux-types';
import type BigNumber from 'bignumber.js';
import { selectTokenByAddress } from '../../../../selectors/tokens';
import { isTokenErc20 } from '../../../../entities/token';
import { BIG_ZERO, fromWeiString, toWei } from '../../../../../../helpers/big-number';
import type { AbiItem } from 'web3-utils';
import { selectChainById } from '../../../../selectors/chains';
import { getWalletConnectionApiInstance, getWeb3Instance } from '../../../instances';

export class ConicMigrateProvider extends BaseMigrateProvider {
  type = 'conic';
  private ammId = 'ethereum-conic';
  private tokenProviderId = 'conic';
  private platformId = 'conic';
  private lpStaker = '0xeC037423A61B634BFc490dcc215236349999ca3d';

  hasMigrateOptions(vault: VaultEntity, state: BeefyState): boolean {
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (!isTokenErc20(depositToken)) {
      return false;
    }
    if (
      depositToken.ammId != this.ammId ||
      depositToken.providerId != this.tokenProviderId ||
      vault.platformId != this.platformId
    ) {
      return false;
    }

    return true;
  }

  async getMigrateBalanceFor(
    vault: VaultEntity,
    userAddress: string,
    state: BeefyState
  ): Promise<BigNumber> {
    if (!this.hasMigrateOptions(vault, state)) {
      return BIG_ZERO;
    }

    const lpToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const chain = selectChainById(state, vault.chainId);
    const web3 = await getWeb3Instance(chain);

    const lpContract = new web3.eth.Contract(ConicAbi, lpToken.address);
    const conicPool = await lpContract.methods.minter().call();
    const lpStaker = new web3.eth.Contract(ConicAbi, this.lpStaker);
    const balance = await lpStaker.methods.getUserBalanceForPool(conicPool, userAddress).call();

    return fromWeiString(balance, lpToken.decimals);
  }

  async getUnstakeMethodFor(
    vault: VaultEntity,
    amount: BigNumber,
    state: BeefyState
    // eslint-disable-next-line
  ): Promise<any> {
    const lpToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const walletApi = await getWalletConnectionApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();

    const lpContract = new web3.eth.Contract(ConicAbi, lpToken.address);
    const conicPool = await lpContract.methods.minter().call();

    const lpStaker = new web3.eth.Contract(ConicAbi, this.lpStaker);
    const amountInWei = toWei(amount, lpToken.decimals);
    return lpStaker.methods.unstake(amountInWei.toString(10), conicPool);
  }
}

const ConicAbi: AbiItem[] = [
  {
    inputs: [],
    name: 'minter',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'conicPool', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'getUserBalanceForPool',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
