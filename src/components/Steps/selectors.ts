import { WalletActionsState } from '../../features/data/reducers/wallet/wallet-action';
import { formatBigDecimals } from '../../helpers/format';
import { isTokenErc20 } from '../../features/data/entities/token';
import { BigNumber } from 'bignumber.js';
import { BeefyState } from '../../redux-types';
import { selectTokenByAddress } from '../../features/data/selectors/tokens';

export function selectMintResult(walletActionsState: WalletActionsState) {
  const result = {
    type: 'mint',
    amount: formatBigDecimals(walletActionsState.data.amount, 2),
  };

  if (walletActionsState.result === 'success') {
    if (
      walletActionsState.data.receipt.events &&
      'Transfer' in walletActionsState.data.receipt.events &&
      isTokenErc20(walletActionsState.data.token)
    ) {
      const userAddress = walletActionsState.data.receipt.from.toLowerCase();
      const mintContractAddress = walletActionsState.data.receipt.to.toLowerCase();
      const mintToken = walletActionsState.data.token;
      const mintTokenAddress = mintToken.address.toLowerCase();
      const transferEvents = Array.isArray(walletActionsState.data.receipt.events['Transfer'])
        ? walletActionsState.data.receipt.events['Transfer']
        : [walletActionsState.data.receipt.events['Transfer']];
      for (const event of transferEvents) {
        // 1. Transfer of the minted token (BeFTM or binSPIRIT)
        // 2. Transfer to the user
        // 3. Transfer is not from the zap contract (like it would be for a mint)
        if (
          event.address.toLowerCase() === mintTokenAddress &&
          event.returnValues.to.toLowerCase() === userAddress &&
          event.returnValues.from.toLowerCase() !== mintContractAddress &&
          event.returnValues.from !== '0x0000000000000000000000000000000000000000'
        ) {
          result.type = 'buy';
          result.amount = formatBigDecimals(
            new BigNumber(event.returnValues.value).shiftedBy(-mintToken.decimals),
            2
          );
          break;
        }
      }
    }
  }

  return result;
}

type VaultMigratedEventValues = {
  asset0: string;
  asset1: string;
  added0: string;
  added1: string;
  returned0: string;
  returned1: string;
};

export function selectMigrationResult(state: BeefyState) {
  const walletActionsState = state.user.walletActions;
  if (walletActionsState.result === 'success') {
    const { receipt, token } = walletActionsState.data;
    const values = (
      Array.isArray(receipt.events['VaultMigrated'])
        ? receipt.events['VaultMigrated'][0]
        : receipt.events['VaultMigrated']
    ).returnValues as VaultMigratedEventValues;
    const token0 = selectTokenByAddress(state, token.chainId, values.asset0);
    const token1 = selectTokenByAddress(state, token.chainId, values.asset1);
    const added0 = new BigNumber(values.added0).shiftedBy(-token0.decimals);
    const added1 = new BigNumber(values.added1).shiftedBy(-token1.decimals);
    const returned0 = new BigNumber(values.returned0).shiftedBy(-token0.decimals);
    const returned1 = new BigNumber(values.returned1).shiftedBy(-token1.decimals);
    const dustMode =
      returned0.isZero() && returned1.isZero()
        ? 'none'
        : !returned0.isZero() && !returned1.isZero()
        ? 'both'
        : 'one';

    return {
      mode: dustMode,
      lp: token.symbol,
      token0: token0.symbol,
      token1: token1.symbol,
      added0: added0.toString(10),
      added1: added1.toString(10),
      returned0: returned0.toString(10),
      returned1: returned1.toString(10),
      dustAmount: (returned0.isZero() ? returned1 : returned0).toString(10),
      dustToken: (returned0.isZero() ? token1 : token1).symbol,
    };
  }

  return null;
}
