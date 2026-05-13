import { css } from '@repo/styles/css';
import { memo } from 'react';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { selectTreasuryBalanceByChainId } from '../../../../../data/selectors/treasury.ts';
import { ExplorerLinks } from '../../../ExplorerLinks/ExplorerLinks.tsx';
import { Assets } from '../Assets/Assets.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface ChainHoldingProps {
  chainId: ChainEntity['id'];
}

export const ChainHolding = memo(function ChainHolding({ chainId }: ChainHoldingProps) {
  const totalUsd = useAppSelector(state => selectTreasuryBalanceByChainId(state, chainId));
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <div className={classes.container}>
      <div
        className={css(
          { colorPalette: `network.${chainId}` },
          styles.title,
          styles.headerNetwork,
          chain?.brand?.header === 'gradient' && styles.headerNetworkGradient
        )}
      >
        <div className={classes.nameContainer}>
          <img className={classes.icon} src={getNetworkSrc(chainId)} alt={chainId} />
          <div className={classes.chainName}>{chain.name}</div>
          <ExplorerLinks chainId={chainId} />
        </div>
        <div className={classes.usdValue}>{formatLargeUsd(totalUsd)}</div>
      </div>
      <Assets chainId={chainId} />
    </div>
  );
});
