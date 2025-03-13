import { type FC, memo, useCallback, useMemo, useState } from 'react';
import { StatSwitcher } from '../StatSwitcher/StatSwitcher.tsx';
import { Card } from '../Card/Card.tsx';
import { CardContent } from '../Card/CardContent.tsx';
import { CardHeader } from '../Card/CardHeader.tsx';
import { CardTitle } from '../Card/CardTitle.tsx';
import { useTranslation } from 'react-i18next';
import { AssetsCard } from '../AssetsCard/AssetsCard.tsx';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { PlatformsCard } from '../PlatformsCard/PlatformsCard.tsx';
import { css } from '@repo/styles/css';
import type { ToggleButtonItem } from '../../../../components/ToggleButtons/ToggleButtons.tsx';

interface DetailsProps {
  vaultId: VaultEntity['id'];
}

const detailsToComponent = {
  platform: PlatformsCard,
  assets: AssetsCard,
} as const satisfies Record<string, FC<DetailsProps>>;

type TabType = keyof typeof detailsToComponent;

const styles = {
  content: css.raw({
    gap: '16px',
  }),
};

export const Details = memo(function Details({ vaultId }: DetailsProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabType>('assets');

  const tabs = useMemo<Array<ToggleButtonItem<TabType>>>(
    () => [
      { value: 'assets', label: t('Details-Assets') },
      { value: 'platform', label: t('Details-Platform') },
    ],
    [t]
  );

  const onTabChange = useCallback(
    (newTab: TabType) => {
      setTab(newTab);
    },
    [setTab]
  );

  const DetailsComponent = detailsToComponent[tab];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
        <StatSwitcher<TabType> onChange={onTabChange} options={tabs} stat={tab} />
      </CardHeader>
      <CardContent css={styles.content}>
        <DetailsComponent vaultId={vaultId} />
      </CardContent>
    </Card>
  );
});
