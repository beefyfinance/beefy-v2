import React, { memo, useCallback, useMemo, useState } from 'react';
import type { Theme } from '@material-ui/core';
import { Collapse, makeStyles, useMediaQuery } from '@material-ui/core';
import { styles } from './styles';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { VaultIdentity } from '../../../../../../components/VaultIdentity';
import { VaultDashboardStats } from '../../../../../../components/VaultStats/VaultDashboardStats';
import { VaultTransactions } from '../VaultTransactions';
import { useAppSelector } from '../../../../../../store';
import {
  selectIsVaultGov,
  selectIsVaultPaused,
  selectIsVaultRetired,
} from '../../../../../data/selectors/vaults';
import clsx from 'clsx';
import { TabletStats } from '../TabletStats';
import { MobileCollapseContent } from '../MobileCollapseContent/MobileCollapseContent';
import { DashboardPnLGraph } from '../../../../../vault/components/PnLGraph';
import { ToggleButtons } from '../../../../../../components/ToggleButtons';
import { useTranslation } from 'react-i18next';
import { selectHasDataToShowGraphByVaultId } from '../../../../../data/selectors/analytics';

const useStyles = makeStyles(styles);

type ListComponentType = 'txHistory' | 'chart';

export type VaultProps = {
  vaultId: VaultEntity['id'];
  address: string;
};
export const Vault = memo<VaultProps>(function Vault({ vaultId, address }) {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const isRetired = useAppSelector(state => selectIsVaultRetired(state, vaultId));
  const isPaused = useAppSelector(state => selectIsVaultPaused(state, vaultId));
  const isGov = useAppSelector(state => selectIsVaultGov(state, vaultId));
  const hasAnalyticsData = useAppSelector(state =>
    selectHasDataToShowGraphByVaultId(state, vaultId, address)
  );

  const handleOpen = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const mobileView = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), { noSsr: true });

  const { t } = useTranslation();

  const [listComponent, setShowStats] = useState<ListComponentType>('txHistory');

  const options = useMemo(() => {
    const items = {
      txHistory: t('Dashboard-TransactionHistory'),
    };
    if (hasAnalyticsData) {
      items['chart'] = t('Dashboard-Chart');
    }

    return items;
  }, [hasAnalyticsData, t]);

  const handleChange = useCallback(newValue => {
    setShowStats(newValue);
  }, []);

  return (
    <div>
      <div
        onClick={handleOpen}
        className={clsx({
          [classes.vault]: true,
          [classes.vaultEarnings]: isGov,
          [classes.vaultPaused]: isPaused,
          [classes.vaultRetired]: isRetired,
          lastBorderRadius: true,
        })}
      >
        <div className={classes.vaultInner}>
          <VaultIdentity isLink={true} networkClassName={classes.network} vaultId={vaultId} />
          <VaultDashboardStats vaultId={vaultId} address={address} />
        </div>
      </div>
      <Collapse in={open} timeout="auto">
        {mobileView ? (
          <MobileCollapseContent address={address} vaultId={vaultId} />
        ) : (
          <>
            {hasAnalyticsData && (
              <div className={classes.toggleContainer}>
                <ToggleButtons
                  selectedClass={classes.activeClassName}
                  value={listComponent}
                  onChange={handleChange}
                  options={options}
                />
              </div>
            )}
            <div className={classes.collapseInner}>
              <TabletStats vaultId={vaultId} />
              {listComponent === 'txHistory' && (
                <VaultTransactions address={address} vaultId={vaultId} />
              )}
              {listComponent === 'chart' && (
                <DashboardPnLGraph address={address} vaultId={vaultId} />
              )}
            </div>
          </>
        )}
      </Collapse>
    </div>
  );
});
