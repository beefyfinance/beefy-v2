import type { Address } from 'viem';
import BigNumber from 'bignumber.js';
import { BoostAbi } from '../../../../../config/abi/BoostAbi.ts';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { toWei } from '../../../../../helpers/big-number.ts';
import type { BoostPromoEntity } from '../../../entities/promo.ts';
import type { TokenErc20 } from '../../../entities/token.ts';
import {
  selectBoostUserBalanceInToken,
  selectUserBalanceOfToken,
} from '../../../selectors/balance.ts';
import type { BeefyState } from '../../../store/types.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';

/** where a withdraw route pulls the user's shares from: their wallet, or a contract holding them on their behalf */
export interface ShareSource {
  sharesWeiFromState(state: BeefyState, userAddress?: string): BigNumber;
  fetchSharesWei(userAddress: string): Promise<BigNumber>;
}

export class WalletShareSource implements ShareSource {
  constructor(private readonly shareToken: TokenErc20) {}

  sharesWeiFromState(state: BeefyState, userAddress?: string): BigNumber {
    const { chainId, address, decimals } = this.shareToken;
    return toWei(selectUserBalanceOfToken(state, chainId, address, userAddress), decimals);
  }

  async fetchSharesWei(userAddress: string): Promise<BigNumber> {
    const { chainId, address } = this.shareToken;
    const contract = fetchContract(address, ERC20Abi, chainId);
    const balance = await contract.read.balanceOf([userAddress as Address]);
    return new BigNumber(balance.toString(10));
  }
}

/** the user's shares are staked: the route pulls the receipt, minted 1:1 for them */
export class BoostShareSource implements ShareSource {
  constructor(
    private readonly boost: BoostPromoEntity,
    private readonly shareToken: TokenErc20
  ) {}

  sharesWeiFromState(state: BeefyState, userAddress?: string): BigNumber {
    return toWei(
      selectBoostUserBalanceInToken(state, this.boost.id, userAddress),
      this.shareToken.decimals
    );
  }

  async fetchSharesWei(userAddress: string): Promise<BigNumber> {
    const contract = fetchContract(this.boost.contractAddress, BoostAbi, this.boost.chainId);
    const balance = await contract.read.balanceOf([userAddress as Address]);
    return new BigNumber(balance.toString(10));
  }
}
