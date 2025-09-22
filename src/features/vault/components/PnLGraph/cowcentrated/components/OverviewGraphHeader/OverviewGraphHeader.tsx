import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ClmPnlTooltipContent } from '../../../../../../../components/PnlTooltip/ClmPnlTooltipContent.tsx';
import { showClmPnlTooltip } from '../../../../../../../components/PnlTooltip/helpers.ts';
import { DivWithTooltip } from '../../../../../../../components/Tooltip/DivWithTooltip.tsx';
import { BIG_ZERO } from '../../../../../../../helpers/big-number.ts';
import {
  formatLargeUsd,
  formatPositiveOrNegative,
  formatTokenDisplayCondensed,
} from '../../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../../data/store/hooks.ts';
import HelpOutline from '../../../../../../../images/icons/mui/HelpOutline.svg?react';
import type { VaultEntity } from '../../../../../../data/entities/vault.ts';
import { selectClmPnl } from '../../../../../../data/selectors/analytics.ts';
import { selectCowcentratedLikeVaultById } from '../../../../../../data/selectors/vaults.ts';
import { Stat } from '../Stat/Stat.tsx';
import { styles } from './styles.ts';
import { PendingIndexNotice } from '../../../common/PendingIndexNotice.tsx';

interface OverviewGraphHeaderProps {
  vaultId: VaultEntity['id'];
}

const useStyles = legacyMakeStyles(styles);

export const OverviewGraphHeader = memo(function OverviewGraphHeader({
  vaultId,
}: OverviewGraphHeaderProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const userPnl = useAppSelector(state => selectClmPnl(state, vaultId));
  const { underlying, tokens, pnl, hold, pendingIndex } = userPnl;
  const hasPnlTooltip = showClmPnlTooltip(userPnl);
  const vault = useAppSelector(state => selectCowcentratedLikeVaultById(state, vaultId));
  const tt = useMemo(() => {
    const suffix = vault.type;
    return (key: string, options?: Parameters<typeof t>[0]) =>
      t([`${key}-${suffix}`, key], options);
  }, [t, vault.type]);

  return (
    <>
      {pendingIndex && <PendingIndexNotice />}
      <div className={classes.statsContainer}>
        <Stat
          tooltipText={tt('pnl-graph-tooltip-deposit')}
          label={t('At Deposit')}
          value0={`${formatTokenDisplayCondensed(
            tokens[0].entry.amount,
            tokens[0].token.decimals,
            6
          )} ${tokens[0].token.symbol}`}
          value1={`${formatTokenDisplayCondensed(
            tokens[1].entry.amount,
            tokens[1].token.decimals,
            6
          )} ${tokens[1].token.symbol}`}
          value2={formatTokenDisplayCondensed(underlying.entry.amount, 18, 6)}
          subValue0={formatLargeUsd(tokens[0].entry.usd)}
          subValue1={formatLargeUsd(tokens[1].entry.usd)}
          subValue2={formatLargeUsd(underlying.entry.usd)}
        />
        <Stat
          tooltipText={tt('pnl-graph-tooltip-now-clm')}
          label={t('Now')}
          value0={`${formatTokenDisplayCondensed(
            tokens[0].now.amount,
            tokens[0].token.decimals,
            6
          )} ${tokens[0].token.symbol}`}
          value1={`${formatTokenDisplayCondensed(
            tokens[1].now.amount,
            tokens[1].token.decimals,
            6
          )} ${tokens[1].token.symbol}`}
          value2={formatTokenDisplayCondensed(underlying.now.amount, 18, 6)}
          subValue0={formatLargeUsd(tokens[0].now.usd)}
          subValue1={formatLargeUsd(tokens[1].now.usd)}
          subValue2={formatLargeUsd(underlying.now.usd)}
        />
        <Stat
          tooltipText={tt('pnl-graph-tooltip-change-clm')}
          label={t('Change')}
          value0={formatPositiveOrNegative(
            tokens[0].diff.amount,
            formatTokenDisplayCondensed(tokens[0].diff.amount, tokens[0].token.decimals, 6),
            tokens[0].token.symbol
          )}
          value1={formatPositiveOrNegative(
            tokens[1].diff.amount,
            formatTokenDisplayCondensed(tokens[1].diff.amount, tokens[1].token.decimals, 6),
            tokens[1].token.symbol
          )}
          value2={
            hasPnlTooltip ?
              <DivWithTooltip
                children={
                  <div className={classes.tooltip}>
                    <span
                      className={
                        pnl.withClaimedPending.usd.gt(BIG_ZERO) ? classes.green : classes.red
                      }
                    >
                      {formatLargeUsd(pnl.withClaimedPending.usd, { positivePrefix: '+$' })}
                      {' PNL'}
                    </span>
                    <HelpOutline />
                  </div>
                }
                tooltip={<ClmPnlTooltipContent userPnl={userPnl} />}
                variant="dark"
                size="compact"
              />
            : <span
                className={pnl.withClaimedPending.usd.gt(BIG_ZERO) ? classes.green : classes.red}
              >
                {formatLargeUsd(pnl.withClaimedPending.usd, { positivePrefix: '+$' })}
                {' PNL'}
              </span>
          }
          subValue2={
            <DivWithTooltip
              children={
                <div className={classes.tooltip}>
                  {`${formatLargeUsd(hold.usd)} HOLD`} <HelpOutline />
                </div>
              }
              tooltip={
                <div>
                  <div className={classes.itemContainer}>
                    <div className={classes.label}>{t('CLM VS HOLD')}</div>
                    <div className={classes.value}>
                      {formatLargeUsd(hold.diff.withClaimedPending, { positivePrefix: '+$' })}
                    </div>
                  </div>
                </div>
              }
              variant="dark"
              size="compact"
            />
          }
        />
      </div>
    </>
  );
});
