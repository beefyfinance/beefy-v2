import { BaseMigrateProvider } from './base';
import type { VaultEntity } from '../../../../entities/vault';
import type { BeefyState } from '../../../../../../redux-types';
import type BigNumber from 'bignumber.js';
import { selectTokenByAddress } from '../../../../selectors/tokens';
import { isTokenErc20 } from '../../../../entities/token';
import { BIG_ZERO, fromWeiString, toWei } from '../../../../../../helpers/big-number';
import { getWalletConnectionApiInstance } from '../../../instances';
import { ConicLpTokenStakerAbi } from '../../../../../../config/abi';
import { selectUserBalanceToMigrateByVaultId } from '../../../../selectors/migration';

export class ConicMigrateProvider extends BaseMigrateProvider {
  type = 'conic';
  private ammId = 'ethereum-conic';
  private tokenProviderId = 'conic';
  private migrationId = 'ethereum-conic';
  private lpStaker = '0xeC037423A61B634BFc490dcc215236349999ca3d';

  hasMigrateOptions(vault: VaultEntity, state: BeefyState): boolean {
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (!isTokenErc20(depositToken)) {
      return false;
    }
    if (
      depositToken.ammId != this.ammId ||
      depositToken.providerId != this.tokenProviderId ||
      vault.migrationId != this.migrationId
    ) {
      return false;
    }

    return true;
  }

  getMigrateBalanceFor(vault: VaultEntity, userAddress: string, state: BeefyState): BigNumber {
    if (!this.hasMigrateOptions(vault, state)) {
      return BIG_ZERO;
    }

    const lpToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const balance = selectUserBalanceToMigrateByVaultId(state, vault.id)
      .shiftedBy(lpToken.decimals)
      .toString();

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

    const lpContract = new web3.eth.Contract(ConicLpTokenStakerAbi, lpToken.address);
    const conicPool = await lpContract.methods.minter().call();

    const lpStaker = new web3.eth.Contract(ConicLpTokenStakerAbi, this.lpStaker);
    const amountInWei = toWei(amount, lpToken.decimals);
    return lpStaker.methods.unstake(amountInWei.toString(10), conicPool);
  }
}
