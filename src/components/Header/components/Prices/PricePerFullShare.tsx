import { memo } from 'react';
import { selectTokenByAddress } from '../../../../features/data/selectors/tokens.ts';
import {
  selectVaultById,
  selectVaultPricePerFullShare,
} from '../../../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { styled } from '@repo/styles/jsx';

export const PricePerFullShare = memo(function PricePerFullShare() {
  const vault = useAppSelector(state => selectVaultById(state, 'bifi-vault'));
  const ppfs = useAppSelector(state => selectVaultPricePerFullShare(state, 'bifi-vault'));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const earnedToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.contractAddress)
  );

  return (
    <Container>
      1 {earnedToken.symbol} {'→'} {ppfs.toString(10)} {depositToken.symbol}
    </Container>
  );
});

const Container = styled('div', {
  base: {
    textStyle: 'subline',
    textTransform: 'none',
    textAlign: 'center',
    lineHeight: '1.1',
    whiteSpace: 'nowrap',
    paddingBlock: '8px',
  },
});
