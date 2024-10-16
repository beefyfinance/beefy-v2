import { memo, useCallback, useMemo, useState, type FC } from 'react';
import { StatSwitcher } from '../StatSwitcher';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { useTranslation } from 'react-i18next';
import { makeStyles, type Theme } from '@material-ui/core';
import { AssetsCard } from '../AssetsCard';
import type { VaultEntity } from '../../../data/entities/vault';
import { PlatformsCard } from '../PlatformsCard';

interface DetailsProps {
  vaultId: VaultEntity['id'];
}

const detailsToComponent = {
  platform: PlatformsCard,
  assets: AssetsCard,
} as const satisfies Record<string, FC<DetailsProps>>;

type TabType = keyof typeof detailsToComponent;

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      padding: '16px',
    },
  },
  content: {
    gap: '16px',
  },
}));

export const Details = memo<DetailsProps>(function Details({ vaultId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [tab, setTab] = useState<TabType>('platform');

  const tabs = useMemo(() => {
    return { platform: t('Details-Platform'), assets: t('Details-Assets') };
  }, [t]);

  const onTabChange = useCallback(
    (newTab: string) => {
      setTab(newTab as TabType);
    },
    [setTab]
  );

  const DetailsComponent = detailsToComponent[tab];

  return (
    <Card>
      <CardHeader className={classes.header}>
        <CardTitle title={'Details'} />
        <StatSwitcher onChange={onTabChange} options={tabs} stat={tab} />
      </CardHeader>
      <CardContent className={classes.content}>
        <DetailsComponent vaultId={vaultId} />
      </CardContent>
    </Card>
  );
});
