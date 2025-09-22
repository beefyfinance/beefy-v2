import { memo } from 'react';
import { selectTokenByAddress } from '../../../../features/data/selectors/tokens.ts';
import {
  selectVaultById,
  selectVaultPricePerFullShare,
} from '../../../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { styled } from '@repo/styles/jsx';
import { AssetsImage } from '../../../AssetsImage/AssetsImage.tsx';

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
      <AssetsImage assetSymbols={[earnedToken.symbol]} chainId={vault.chainId} size={24} />1{' '}
      {earnedToken.symbol} {'='}{' '}
      <AssetsImage assetSymbols={[depositToken.symbol]} chainId={vault.chainId} size={24} />{' '}
      {ppfs.toFixed(6)} {depositToken.symbol}
    </Container>
  );
});

const Container = styled('div', {
  base: {
    textStyle: 'body',
    textTransform: 'none',
    whiteSpace: 'nowrap',
    paddingBlock: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
});
