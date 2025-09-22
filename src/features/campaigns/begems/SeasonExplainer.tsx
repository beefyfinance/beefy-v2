import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import beefyLogo from '../../../images/bifi-logos/header-logo.svg';
import sonicLogo from '../../../images/campaigns/begems/sonic.svg';
import { selectBeGemsSeasonExplainer } from '../../data/selectors/campaigns/begems.ts';
import { useAppSelector } from '../../data/store/hooks.ts';

type SeasonExplainerProps = {
  season: number;
};

export const SeasonExplainer = memo(function SeasonExplainer({ season }: SeasonExplainerProps) {
  const { title, paragraphs } = useAppSelector(state => selectBeGemsSeasonExplainer(state, season));
  return (
    <Layout>
      <Title>{title}</Title>
      {paragraphs.map((text, index) => (
        <Text key={index}>{text}</Text>
      ))}
      <Logos>
        <Logo src={sonicLogo} alt="Sonic Labs" />
        <Logo src={beefyLogo} alt="Beefy" />
      </Logos>
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '32px 16px 44px 16px', // 32+12px bottom
    marginBottom: '-12px', // -12px to get 32px space on bottom, with tabs over the top
    borderTopRadius: '20px',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.00) 100.07%), rgba(36, 40, 66, 0.40)',
    sm: {
      borderRadius: '0',
      padding: '0',
      background: 'none',
      marginBottom: '0',
    },
  },
});

const Title = styled('h1', {
  base: {
    textStyle: 'h1',
    color: 'text.lightest',
    width: '100%',
    lg: {
      textStyle: 'h1.accent',
    },
  },
});

const Text = styled('p', {
  base: {
    color: 'text.middle',
  },
});

const Logos = styled('div', {
  base: {
    display: 'flex',
    gap: '24px',
    height: '39px',
    marginTop: '16px',
  },
});

const Logo = styled('img', {
  base: {
    height: '39px',
    width: 'auto',
  },
});
