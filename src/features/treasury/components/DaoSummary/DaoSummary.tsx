import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '../../../../components/Container/Container.tsx';
import { SummaryStats } from '../../../../components/SummaryStats/SummaryStats.tsx';
import { formatLargeUsd } from '../../../../helpers/format.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { selectTreasuryStats } from '../../../data/selectors/treasury.ts';
import { styled } from '@repo/styles/jsx';

export const DaoSummary = memo(function DaoSummary() {
  const { t } = useTranslation();

  const { holdings, beefyHeld, assets, stables } = useAppSelector(selectTreasuryStats);

  const DaoStats = useMemo(() => {
    return [
      {
        label: t('Summary-Holdings'),
        value: formatLargeUsd(holdings),
      },
      {
        label: t('Summary-Stables'),
        value: formatLargeUsd(stables),
      },
      {
        label: t('Summary-Held-BIFI'),
        value: beefyHeld.toFixed(0),
      },
      {
        label: t('Summary-Asset-Diversity'),
        value: `${assets}`,
      },
    ];
  }, [assets, beefyHeld, holdings, stables, t]);

  return (
    <HeaderContainer>
      <Container maxWidth="lg">
        <Title>{t('Treasury-Title')}</Title>
        <SummaryStats items={DaoStats} />
      </Container>
    </HeaderContainer>
  );
});

const HeaderContainer = styled('div', {
  base: {
    backgroundColor: 'background.header',
    paddingBlock: '12px 16px',
    sm: {
      paddingBlock: '8px 24px',
    },
  },
});

const Title = styled('div', {
  base: {
    textStyle: 'h1',
    marginBottom: '24px',
  },
});
