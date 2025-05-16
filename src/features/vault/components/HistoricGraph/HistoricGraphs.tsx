import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectHistoricalAvailableCharts } from '../../../data/selectors/historical.ts';
import { selectTokenByAddress } from '../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { Card } from '../Card/Card.tsx';
import { CardContent } from '../Card/CardContent.tsx';
import { CardHeader } from '../Card/CardHeader.tsx';
import { CardTitle } from '../Card/CardTitle.tsx';
import { StatSwitcher } from '../StatSwitcher/StatSwitcher.tsx';
import { CurrentCowcentratedRangeIfAvailable } from './CurrentCowcentratedRange/CurrentCowcentratedRange.tsx';
import { GraphWithControls } from './GraphWithControls/GraphWithControls.tsx';
import { styles } from './styles.ts';
import type { ChartStat } from './types.ts';
import { getDefaultStat } from './utils.ts';

type HistoricGraphsProps = {
  vaultId: VaultEntity['id'];
};
export const HistoricGraphs = memo(function HistoricGraphs({ vaultId }: HistoricGraphsProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const { oracleId } = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const availableStats = useAppSelector(state =>
    selectHistoricalAvailableCharts(state, vaultId, oracleId)
  );
  const [stat, setStat] = useState<ChartStat>(() => getDefaultStat(availableStats));

  const options = useMemo(
    () =>
      availableStats.map(stat => ({
        value: stat,
        label: t([`Graph-${stat}`, `Graph-${vault.type}-${stat}`]),
      })),
    [availableStats, t, vault.type]
  );

  const [inverted, setInverted] = useState(false);

  const toggleInverted = useCallback(() => {
    setInverted(value => !value);
  }, []);

  return (
    <Card css={styles.container}>
      <CardHeader>
        <CardTitle>{t('Graph-RateHist')}</CardTitle>
        <StatSwitcher<ChartStat> stat={stat} options={options} onChange={setStat} />
      </CardHeader>
      <CardContent css={styles.content}>
        {stat === 'clm' && (
          <CurrentCowcentratedRangeIfAvailable
            inverted={inverted}
            toggleInverted={toggleInverted}
            vaultId={vaultId}
          />
        )}
        <GraphWithControls inverted={inverted} vaultId={vaultId} oracleId={oracleId} stat={stat} />
      </CardContent>
    </Card>
  );
});
