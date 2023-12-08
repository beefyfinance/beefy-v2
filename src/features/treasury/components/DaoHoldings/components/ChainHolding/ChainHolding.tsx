import { memo } from 'react';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { selectChainById } from '../../../../../data/selectors/chains';
import { makeStyles } from '@material-ui/core';
import { formatBigUsd } from '../../../../../../helpers/format';
import type { ChainEntity } from '../../../../../data/entities/chain';
import {
  selectTreasuryBalanceByChainId,
  selectTreasuryBalanceByMMId,
} from '../../../../../data/selectors/treasury';

import { Assets, MMAssets } from '../Assets';
import clsx from 'clsx';
import { ExplorerLinks } from '../../../ExplorerLinks';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc';
import { getPartnerSrc } from '../../../../../../helpers/partnerSrc';
import { Tooltip } from '../../../../../../components/Tooltip';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

interface ChainHoldingProps {
  chainId: ChainEntity['id'];
}

interface MMHoldingProps {
  mmId: string;
}

export const ChainHolding = memo<ChainHoldingProps>(function ChainHolding({ chainId }) {
  const totalUsd = useAppSelector(state => selectTreasuryBalanceByChainId(state, chainId));

  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <div className={classes.container}>
      <div className={clsx(classes.title, classes[`headerNetwork-${chainId}`])}>
        <div className={classes.nameContainer}>
          <img className={classes.icon} src={getNetworkSrc(chainId)} alt={chainId} />
          <div className={classes.chainName}>{chain.name}</div>
          <ExplorerLinks chainId={chainId} />
        </div>
        <div className={classes.usdValue}>{formatBigUsd(totalUsd)}</div>
      </div>
      <Assets chainId={chainId} />
    </div>
  );
});

export const MMHolding = memo<MMHoldingProps>(function MMHolding({ mmId }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const totalUsd = useAppSelector(state => selectTreasuryBalanceByMMId(state, mmId));
  return (
    <div className={classes.container}>
      <div className={clsx(classes.title, classes[`headerMM-${mmId.toLowerCase()}`])}>
        <div className={classes.mmNameContainer}>
          <img className={classes.icon} src={getPartnerSrc(mmId)} alt={mmId} />
          <div className={classes.mmName}>{mmId}</div>
          <Tooltip
            content={<BasicTooltipContent title={t('MarketMaker-Managed')} />}
            placement="top"
          >
            <div className={classes.marketMakerAnnotation}>MM</div>
          </Tooltip>
        </div>
        <div className={classes.usdValue}>{formatBigUsd(totalUsd)}</div>
      </div>
      <MMAssets mmId={mmId} />
    </div>
  );
});
