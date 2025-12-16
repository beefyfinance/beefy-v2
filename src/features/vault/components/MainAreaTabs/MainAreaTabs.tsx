import { memo, useState, useCallback } from 'react';
import { styled } from '@repo/styles/jsx';
import { type VaultEntity } from '../../../data/entities/vault.ts';
import { PromoCardLoader } from '../BoostCard/PromoCardLoader.tsx';
import { PnLGraphIfWallet } from '../PnLGraph/PnLGraphIfWallet.tsx';
import { HistoricGraphsLoader } from '../HistoricGraph/HistoricGraphsLoader.tsx';
import { LiquidityPoolBreakdownLoader } from '../LiquidityPoolBreakdown/LiquidityPoolBreakdown.tsx';
import { Explainer } from '../Explainer/Explainer.tsx';
import { RiskChecklistCard } from '../RiskChecklistCard/RiskChecklistCard.tsx';
import { Details } from '../Details/Details.tsx';

type TabId = 'overview' | 'charts' | 'liquidity' | 'details';

type TabConfig = {
  id: TabId;
  label: string;
};

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'charts', label: 'Charts' },
  { id: 'liquidity', label: 'Liquidity' },
  { id: 'details', label: 'Details' },
];

export type MainAreaTabsProps = {
  vaultId: VaultEntity['id'];
};

export const MainAreaTabs = memo(function MainAreaTabs({ vaultId }: MainAreaTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
  }, []);

  return (
    <Container>
      <TabsHeader>
        {TABS.map(tab => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsHeader>
      <TabContent>
        <TabPanel visible={activeTab === 'overview'}>
          <PromoCardLoader vaultId={vaultId} />
          <PnLGraphIfWallet vaultId={vaultId} />
        </TabPanel>
        <TabPanel visible={activeTab === 'charts'}>
          <HistoricGraphsLoader vaultId={vaultId} />
        </TabPanel>
        <TabPanel visible={activeTab === 'liquidity'}>
          <LiquidityPoolBreakdownLoader vaultId={vaultId} />
        </TabPanel>
        <TabPanel visible={activeTab === 'details'}>
          <Explainer vaultId={vaultId} />
          <RiskChecklistCard vaultId={vaultId} />
          <Details vaultId={vaultId} />
        </TabPanel>
      </TabContent>
    </Container>
  );
});

const Container = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
});

const TabsHeader = styled('div', {
  base: {
    display: 'flex',
    flexShrink: 0,
    backgroundColor: 'background.content.dark',
    borderBottom: '1px solid',
    borderColor: 'bayOfMany',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

const TabButton = styled('button', {
  base: {
    textStyle: 'body.medium',
    position: 'relative',
    flexShrink: 0,
    color: 'text.dark',
    paddingBlock: '12px',
    paddingInline: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
    _hover: {
      color: 'text.middle',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: 0,
      right: 0,
      height: '2px',
      backgroundColor: 'transparent',
      transition: 'background-color 0.2s ease',
    },
  },
  variants: {
    active: {
      true: {
        color: 'text.light',
        cursor: 'default',
        '&::after': {
          backgroundColor: 'green.40',
        },
      },
    },
  },
});

const TabContent = styled('div', {
  base: {
    flex: 1,
    overflow: 'auto',
  },
});

const TabPanel = styled('div', {
  base: {
    display: 'none',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
  },
  variants: {
    visible: {
      true: {
        display: 'flex',
      },
    },
  },
});
