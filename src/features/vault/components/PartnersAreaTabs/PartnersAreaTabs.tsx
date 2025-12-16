import { memo, useState, useCallback } from 'react';
import { styled } from '@repo/styles/jsx';
import { type VaultEntity } from '../../../data/entities/vault.ts';
import { InsuranceCards } from '../InsuranceCards/InsuranceCards.tsx';
import { LeverageCards } from '../LeverageCards/LeverageCards.tsx';
import { GamingCards } from '../GamingCards/GamingCards.tsx';

type TabId = 'insurance' | 'leverage' | 'gaming';

type TabConfig = {
  id: TabId;
  label: string;
};

const TABS: TabConfig[] = [
  { id: 'insurance', label: 'Insurance' },
  { id: 'leverage', label: 'Leverage' },
  { id: 'gaming', label: 'Gaming' },
];

export type PartnersAreaTabsProps = {
  vaultId: VaultEntity['id'];
};

export const PartnersAreaTabs = memo(function PartnersAreaTabs({ vaultId }: PartnersAreaTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('insurance');

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
        <TabPanel visible={activeTab === 'insurance'}>
          <InsuranceCards vaultId={vaultId} />
        </TabPanel>
        <TabPanel visible={activeTab === 'leverage'}>
          <LeverageCards vaultId={vaultId} />
        </TabPanel>
        <TabPanel visible={activeTab === 'gaming'}>
          <GamingCards vaultId={vaultId} />
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
  },
});

const TabButton = styled('button', {
  base: {
    textStyle: 'body.sm.medium',
    position: 'relative',
    flex: 1,
    color: 'text.dark',
    paddingBlock: '10px',
    paddingInline: '12px',
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
          backgroundColor: 'text.boosted',
        },
      },
    },
  },
});

const TabContent = styled('div', {
  base: {
    flex: 1,
    overflow: 'auto',
    padding: '12px',
  },
});

const TabPanel = styled('div', {
  base: {
    display: 'none',
    flexDirection: 'column',
    gap: '12px',
  },
  variants: {
    visible: {
      true: {
        display: 'flex',
      },
    },
  },
});
