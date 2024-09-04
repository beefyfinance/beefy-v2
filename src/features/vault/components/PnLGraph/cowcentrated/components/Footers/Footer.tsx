import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
import { BasicTabs } from '../../../../../../../components/Tabs/BasicTabs';
import type { VaultEntity } from '../../../../../../data/entities/vault';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAppSelector } from '../../../../../../../store';
import { selectCowcentratedLikeVaultDepositTokens } from '../../../../../../data/selectors/tokens';

const useStyles = makeStyles(styles);

interface CommonFooterProps {
  period: number;
  handlePeriod: (period: number) => void;
  labels: string[];
  className?: string;
  tabsClassName?: string;
}

interface OverviewFooterProps extends CommonFooterProps {
  position: boolean;
}

export const OverviewFooter = memo<OverviewFooterProps>(function OverviewFooter({
  period,
  handlePeriod,
  labels,
  className,
  tabsClassName,
  position,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={clsx(classes.footer, className)}>
      <div className={classes.legendContainer}>
        {position ? (
          <div className={classes.legendItem}>
            <div className={classes.positionReferenceLine} />
            {t('Position')}
          </div>
        ) : null}
        <div className={classes.legendItem}>
          <div className={classes.usdReferenceLine} />
          {t('Position Value')}
        </div>
        <div className={classes.legendItem}>
          <div className={classes.holdReferenceLine} />
          {t('HOLD Value')}
        </div>
      </div>
      <div className={clsx(classes.tabsContainer, tabsClassName)}>
        <BasicTabs
          onChange={(newValue: number) => handlePeriod(newValue)}
          labels={labels}
          value={period}
        />
      </div>
    </div>
  );
});

type FooterProps = CommonFooterProps & {
  vaultId: VaultEntity['id'];
};

export const FeesFooter = memo<FooterProps>(function Footer({
  period,
  handlePeriod,
  labels,
  tabsClassName,
  vaultId,
  className,
}) {
  const classes = useStyles();
  const { token0, token1 } = useAppSelector(state =>
    selectCowcentratedLikeVaultDepositTokens(state, vaultId)
  );

  return (
    <div className={clsx(classes.footer, className)}>
      <div className={classes.legendContainer}>
        <div className={classes.legendItem}>
          <div className={classes.usdReferenceLine} />
          {token0.symbol}
        </div>
        <div className={classes.legendItem}>
          <div className={classes.token1ReferenceLine} />
          {token1.symbol}
        </div>
      </div>
      <div className={clsx(classes.tabsContainer, tabsClassName)}>
        <BasicTabs
          onChange={(newValue: number) => handlePeriod(newValue)}
          labels={labels}
          value={period}
        />
      </div>
    </div>
  );
});
