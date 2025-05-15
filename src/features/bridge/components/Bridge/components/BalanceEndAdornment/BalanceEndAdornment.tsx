import { memo } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { formatTokenDisplayCondensed } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance.ts';
import { selectBridgeDepositTokenForChainId } from '../../../../../data/selectors/bridge.ts';
import { selectIsWalletConnected } from '../../../../../data/selectors/wallet.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface BalanceEndAdornmentProps<V extends string = string> {
  value: V;
}

export const BalanceEndAdornment = memo(function BalanceEndAdornment({
  value: chainId,
}: BalanceEndAdornmentProps<ChainEntity['id']>) {
  const classes = useStyles();
  const token = useAppSelector(state => selectBridgeDepositTokenForChainId(state, chainId));
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const balance = useAppSelector(state =>
    selectUserBalanceOfToken(state, token.chainId, token.address)
  );
  const showComponent = isWalletConnected && balance.isGreaterThan(BIG_ZERO);

  if (showComponent) {
    return (
      <div className={classes.balance}>
        {formatTokenDisplayCondensed(balance, token.decimals, 6)}
      </div>
    );
  }

  return null;
});
