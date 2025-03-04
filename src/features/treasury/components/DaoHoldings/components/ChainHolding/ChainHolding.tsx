import { memo } from 'react';
import { styles } from './styles.ts';
import { useAppSelector } from '../../../../../../store.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import {
  selectTreasuryBalanceByChainId,
  selectTreasuryBalanceByMMId,
} from '../../../../../data/selectors/treasury.ts';

import { Assets, MMAssets } from '../Assets/Assets.tsx';
import { css } from '@repo/styles/css';
import { ExplorerLinks } from '../../../ExplorerLinks/ExplorerLinks.tsx';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc.ts';
import { getPartnerSrc } from '../../../../../../helpers/partnerSrc.ts';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent.tsx';
import { useTranslation } from 'react-i18next';
import { DivWithTooltip } from '../../../../../../components/Tooltip/DivWithTooltip.tsx';
import type { SystemStyleObject } from '@repo/styles/types';

const useStyles = legacyMakeStyles(styles);

interface ChainHoldingProps {
  chainId: ChainEntity['id'];
}

interface MMHoldingProps {
  mmId: string;
}

export const ChainHolding = memo(function ChainHolding({ chainId }: ChainHoldingProps) {
  const totalUsd = useAppSelector(state => selectTreasuryBalanceByChainId(state, chainId));

  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <div className={classes.container}>
      <div className={css(styles.title, styles[`headerNetwork-${chainId}`])}>
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

export const MMHolding = memo(function MMHolding({ mmId }: MMHoldingProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const totalUsd = useAppSelector(state => selectTreasuryBalanceByMMId(state, mmId));
  const brandHeaderStyles = (styles as Record<string, SystemStyleObject>)[`headerMM-${mmId}`];

  return (
    <div className={classes.container}>
      <div className={css(styles.title, brandHeaderStyles)}>
        <div className={classes.mmNameContainer}>
          <img className={classes.icon} src={getPartnerSrc(mmId.toLowerCase())} alt={mmId} />
          <div className={classes.mmName}>{mmId}</div>
          <DivWithTooltip
            tooltip={<BasicTooltipContent title={t('MarketMaker-Managed')} />}
            placement="top"
          >
            <div className={classes.marketMakerAnnotation}>MM</div>
          </DivWithTooltip>
        </div>
        <div className={classes.usdValue}>{formatLargeUsd(totalUsd)}</div>
      </div>
      <MMAssets mmId={mmId} />
    </div>
  );
});
