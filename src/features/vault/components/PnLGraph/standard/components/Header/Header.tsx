import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import type BigNumber from 'bignumber.js';
import { css, type CssStyles } from '@repo/styles/css';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconWithTooltip } from '../../../../../../../components/Tooltip/IconWithTooltip.tsx';
import { BasicTooltipContent } from '../../../../../../../components/Tooltip/BasicTooltipContent.tsx';
import {
  formatLargePercent,
  formatLargeUsd,
  formatPositiveOrNegative,
  formatTokenDisplay,
  formatTokenDisplayCondensed,
} from '../../../../../../../helpers/format.ts';
import { useAppSelector } from '../../../../../../../store.ts';
import type { VaultEntity } from '../../../../../../data/entities/vault.ts';
import { selectStandardGovPnl } from '../../../../../../data/selectors/analytics.ts';

import { styles } from './styles.ts';
import { BIG_ZERO } from '../../../../../../../helpers/big-number.ts';
import { DivWithTooltip } from '../../../../../../../components/Tooltip/DivWithTooltip.tsx';

const useStyles = legacyMakeStyles(styles);

interface HeaderProps {
  vaultId: VaultEntity['id'];
}

export const Header = memo(function Header({ vaultId }: HeaderProps) {
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
          css={styles.greenValue}
          percentage={yieldPercentage}
        />
      </HeaderItem>
      <HeaderItem
        tooltipText={t('pnl-graph-tooltip-pnl')}
        label={t('PNL')}
        subValue={formatLargePercent(pnlPercentage)}
      >
        <div
          className={css(
            styles.value,
            totalPnlUsd.gt(BIG_ZERO) ? styles.greenValue : styles.redValue
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
  css?: CssStyles;
  children: ReactNode;
  tooltipText: string;
  subValue?: string;
}

const HeaderItem = memo(function HeaderItem({
  label,
  css: cssProp,
  tooltipText,
  children,
  subValue,
}: HeaderItemProps) {
  const classes = useStyles();

  return (
    <div className={css(styles.itemContainer, cssProp)}>
      <div className={classes.labelContainer}>
        <div className={classes.label}>{label}</div>
        <IconWithTooltip tooltip={tooltipText} iconCss={styles.center} />
      </div>
      {children}
      {subValue && <div className={classes.subValue}>{subValue}</div>}
    </div>
  );
});

interface SharesValueProps {
  css?: CssStyles;
  percentage?: BigNumber;
  amount: BigNumber;
  decimals: number;
}

const SharesValue = memo(function SharesValue({
  css: cssProp,
  percentage,
  amount,
  decimals,
}: SharesValueProps) {
  const fullAmount = formatTokenDisplay(amount, decimals);
  const shortAmount = formatTokenDisplayCondensed(amount, decimals);

  return (
    <DivWithTooltip tooltip={<BasicTooltipContent title={fullAmount} />}>
      <div className={css(styles.value, cssProp)}>
        <div className={css(styles.withTooltip, styles.textOverflow)}>{shortAmount}</div>
        {percentage && <span>({formatLargePercent(percentage)})</span>}
      </div>
    </DivWithTooltip>
  );
});
