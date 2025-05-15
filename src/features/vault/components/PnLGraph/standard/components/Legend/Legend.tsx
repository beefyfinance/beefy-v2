import { css } from '@repo/styles/css';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../../../../data/entities/vault.ts';
import { selectVaultById } from '../../../../../../data/selectors/vaults.ts';

const useStyles = legacyMakeStyles({
  items: css.raw({
    display: 'flex',
    columnGap: '24px',
    alignItems: 'center',
    padding: '0px 24px',
    justifyContent: 'space-between',
    mdDown: {
      padding: '0px 16px ',
    },
  }),
  colorReference: css.raw({
    height: '2px',
    width: '12px',
  }),
  legendItem: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  }),
});

export interface LegendProps {
  vaultId: VaultEntity['id'];
}

export const Legend = memo(function Legend({ vaultId }: LegendProps) {
  const classes = useStyles();
  const { t } = useTranslation();

  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const isSingleAssetVault = useMemo(() => {
    return vault.assetIds.length === 1;
  }, [vault.assetIds.length]);

  return (
    <div className={classes.items}>
      <LegendItem
        color="#4DB258"
        text={t(
          isSingleAssetVault ? 'pnl-graph-legend-amount-single' : 'pnl-graph-legend-amount-lp',
          {
            token: vault.assetIds[0],
          }
        )}
      />
      <LegendItem color="#5C70D6" text={t('pnl-graph-legend-usd')} />
    </div>
  );
});

interface LegendItemProps {
  color: string;
  text: string;
}

const LegendItem = memo(function LegendItem({ color, text }: LegendItemProps) {
  const classes = useStyles();

  return (
    <div className={classes.legendItem}>
      <div className={classes.colorReference} style={{ backgroundColor: color }} />
      <div>{text}</div>
    </div>
  );
});
