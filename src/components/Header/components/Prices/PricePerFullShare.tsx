import { memo } from 'react';
import { css } from '@repo/styles/css';
import { useAppSelector } from '../../../../store.ts';
import {
  selectVaultById,
  selectVaultPricePerFullShare,
} from '../../../../features/data/selectors/vaults.ts';
import { selectTokenByAddress } from '../../../../features/data/selectors/tokens.ts';

export const PricePerFullShare = memo(function PricePerFullShare() {
  const className = css({
    textStyle: 'subline-lg',
    textTransform: 'none',
    textAlign: 'center',
    lineHeight: '1.1',
    whiteSpace: 'nowrap',
  });
  const vault = useAppSelector(state => selectVaultById(state, 'bifi-vault'));
  const ppfs = useAppSelector(state => selectVaultPricePerFullShare(state, 'bifi-vault'));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const earnedToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.contractAddress)
  );

  return (
    <div className={className}>
      1 {earnedToken.symbol} {'→'} {ppfs.toString(10)} {depositToken.symbol}
    </div>
  );
});
