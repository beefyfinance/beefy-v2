import { css, type CssStyles } from '@repo/styles/css';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButtons } from '../../../../../../../components/ToggleButtons/ToggleButtons.tsx';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../../../../data/entities/vault.ts';
import { selectCowcentratedLikeVaultDepositTokens } from '../../../../../../data/selectors/tokens.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface CommonFooterProps {
  period: number;
  handlePeriod: (period: number) => void;
  labels: string[];
  css?: CssStyles;
}

interface OverviewFooterProps extends CommonFooterProps {
  position: boolean;
}

export const OverviewFooter = memo(function OverviewFooter({
  period,
  handlePeriod,
  labels,
  css: cssProp,
  position,
}: OverviewFooterProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const options = useMemo(
    () => labels.map((label, index) => ({ value: index.toString(), label })),
    [labels]
  );
  const handleChange = useCallback(
    (newValue: string) => {
      handlePeriod(Number(newValue));
    },
    [handlePeriod]
  );

  return (
    <div className={css(styles.footer, cssProp)}>
      <div className={classes.legendContainer}>
        {position ?
          <div className={classes.legendItem}>
            <div className={classes.positionReferenceLine} />
            {t('Position')}
          </div>
        : null}
        <div className={classes.legendItem}>
          <div className={classes.usdReferenceLine} />
          {t('Position Value')}
        </div>
        <div className={classes.legendItem}>
          <div className={classes.holdReferenceLine} />
          {t('HOLD Value')}
        </div>
      </div>

      <ToggleButtons
        value={period.toString()}
        options={options}
        onChange={handleChange}
        noBackground={true}
        noPadding={true}
        noBorder={true}
        variant="range"
      />
    </div>
  );
});

type FooterProps = CommonFooterProps & {
  vaultId: VaultEntity['id'];
};

export const FeesFooter = memo(function Footer({
  period,
  handlePeriod,
  labels,
  vaultId,
  css: cssProp,
}: FooterProps) {
  const classes = useStyles();
  const [token0, token1] = useAppSelector(state =>
    selectCowcentratedLikeVaultDepositTokens(state, vaultId)
  );
  const options = useMemo(
    () => labels.map((label, index) => ({ value: index.toString(), label })),
    [labels]
  );
  const handleChange = useCallback(
    (newValue: string) => {
      handlePeriod(Number(newValue));
    },
    [handlePeriod]
  );

  return (
    <div className={css(styles.footer, cssProp)}>
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
      <ToggleButtons
        value={period.toString()}
        options={options}
        onChange={handleChange}
        noBackground={true}
        noPadding={true}
        variant="range"
      />
    </div>
  );
});
