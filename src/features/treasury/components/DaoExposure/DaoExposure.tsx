import { type FC, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../../../components/Section/Section.tsx';
import { TreasuryAvailabilityExposure } from '../TreasuryAvailabilityExposure/TreasuryAvailabilityExposure.tsx';
import { TreasuryChainExposure } from '../TreasuryChainExposure/TreasuryChainExposure.tsx';
import { TreasuryTokensExposure } from '../TreasuryTokenExposure/TreasuryTokenExposure.tsx';
import { styled } from '@repo/styles/jsx';

enum ChartEnum {
  Token = 1,
  Chain,
  Availability,
}

const chartToComponent: Record<ChartEnum, FC> = {
  [ChartEnum.Token]: TreasuryTokensExposure,
  [ChartEnum.Chain]: TreasuryChainExposure,
  [ChartEnum.Availability]: TreasuryAvailabilityExposure,
};

export const DaoExposure = memo(function DaoExposure() {
  const { t } = useTranslation();

  const items = useMemo(() => {
    return [
      { key: 'tokenExposure', value: ChartEnum.Token, text: t('Tokens') },
      { key: 'chainExposure', value: ChartEnum.Chain, text: t('Chains') },
      {
        key: 'availabilityExposure',
        value: ChartEnum.Availability,
        text: t('Exposure-Availability'),
      },
    ];
  }, [t]);

  const [chart, setChart] = useState<ChartEnum>(ChartEnum.Token);

  const Chart = useMemo(() => chartToComponent[chart], [chart]);

  return (
    <Section>
      <ChartsContainer>
        <OptionsContainer>
          {items.map(item => {
            return (
              <Item
                key={item.key}
                onClick={() => setChart(item.value)}
                active={item.value === chart}
              >
                {item.text}
              </Item>
            );
          })}
        </OptionsContainer>
        <Chart />
      </ChartsContainer>
    </Section>
  );
});

const ChartsContainer = styled('div', {
  base: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'background.content',
    borderRadius: '8px',
    display: 'grid',
    mdOnly: {
      height: '120px',
    },
    lg: {
      padding: '16px 24px',
    },
  },
});

const OptionsContainer = styled('div', {
  base: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    md: {
      marginBottom: '16px',
    },
  },
});

const Item = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.dark',
    whiteSpace: 'nowrap',
    '&:hover': {
      color: 'text.light',
      cursor: 'pointer',
    },
  },
  variants: {
    active: {
      true: {
        color: 'text.light',
      },
    },
  },
});
