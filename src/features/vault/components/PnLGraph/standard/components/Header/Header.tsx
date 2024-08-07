import { makeStyles } from '@material-ui/core';
import { HelpOutline } from '@material-ui/icons';
import type BigNumber from 'bignumber.js';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '../../../../../../../components/Tooltip';
import { BasicTooltipContent } from '../../../../../../../components/Tooltip/BasicTooltipContent';
import {
  formatLargeUsd,
  formatTokenDisplayCondensed,
  formatTokenDisplay,
  formatLargePercent,
  formatPositiveOrNegative,
} from '../../../../../../../helpers/format';
import { useAppSelector } from '../../../../../../../store';
import type { VaultEntity } from '../../../../../../data/entities/vault';
import { selectStandardGovPnl } from '../../../../../../data/selectors/analytics';

import { styles } from './styles';
import { BIG_ZERO } from '../../../../../../../helpers/big-number';

const useStyles = makeStyles(styles);

interface HeaderProps {
  vaultId: VaultEntity['id'];
}

export const Header = memo<HeaderProps>(function Header({ vaultId }) {
  const { t } = useTranslation();

  const {
    usdBalanceAtDeposit,
    balanceAtDeposit,
    depositUsd,
    deposit,
    tokenDecimals,
    totalYieldUsd,
    totalYield,
    yieldPercentage,
    totalPnlUsd,
    pnlPercentage,
  } = useAppSelector(state => selectStandardGovPnl(state, vaultId));

  const classes = useStyles();

  return (
    <div className={classes.header}>
      <HeaderItem
        tooltipText={t('pnl-graph-tooltip-deposit')}
        label={t('At Deposit')}
        subValue={formatLargeUsd(usdBalanceAtDeposit)}
      >
        <SharesValue amount={balanceAtDeposit} decimals={tokenDecimals} />
      </HeaderItem>
      <HeaderItem
        tooltipText={t('pnl-graph-tooltip-now-vault')}
        label={t('Now')}
        subValue={formatLargeUsd(depositUsd)}
      >
        <SharesValue amount={deposit} decimals={tokenDecimals} />
      </HeaderItem>
      <HeaderItem
        tooltipText={t('pnl-graph-tooltip-yield')}
        label={t('Yield')}
        subValue={formatLargeUsd(totalYieldUsd)}
      >
        <SharesValue
          amount={totalYield}
          decimals={tokenDecimals}
          className={classes.greenValue}
          percentage={yieldPercentage}
        />
      </HeaderItem>
      <HeaderItem
        tooltipText={t('pnl-graph-tooltip-pnl')}
        label={t('PNL')}
        subValue={formatLargePercent(pnlPercentage)}
      >
        <div
          className={clsx(
            classes.value,
            totalPnlUsd.gt(BIG_ZERO) ? classes.greenValue : classes.redValue
          )}
        >
          {formatPositiveOrNegative(totalPnlUsd, formatLargeUsd(totalPnlUsd))}{' '}
        </div>
      </HeaderItem>
    </div>
  );
});

interface HeaderItemProps {
  label: string;
  border?: boolean;
  className?: string;
  children: ReactNode;
  tooltipText: string;
  subValue?: string;
}

const HeaderItem = memo<HeaderItemProps>(function HeaderItem({
  label,
  className,
  tooltipText,
  children,
  subValue,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.itemContainer, className)}>
      <div className={classes.labelContainer}>
        <div className={classes.label}>{label}</div>
        <Tooltip triggerClass={classes.center} content={tooltipText}>
          <HelpOutline />
        </Tooltip>
      </div>
      {children}
      {subValue && <div className={classes.subValue}>{subValue}</div>}
    </div>
  );
});

interface SharesValueProps {
  className?: string;
  percentage?: BigNumber;
  amount: BigNumber;
  decimals: number;
}

const SharesValue = memo<SharesValueProps>(function SharesValue({
  className,
  percentage,
  amount,
  decimals,
}) {
  const classes = useStyles();

  const fullAmount = formatTokenDisplay(amount, decimals);
  const shortAmount = formatTokenDisplayCondensed(amount, decimals);

  return (
    <Tooltip content={<BasicTooltipContent title={fullAmount} />}>
      <div className={clsx(classes.value, className)}>
        <div className={clsx(classes.withTooltip, classes.textOverflow)}>{shortAmount}</div>
        {percentage && <span>({formatLargePercent(percentage)})</span>}
      </div>
    </Tooltip>
  );
});
