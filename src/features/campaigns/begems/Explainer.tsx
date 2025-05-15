import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import beefyLogo from '../../../images/bifi-logos/header-logo.svg';
import sonicLogo from '../../../images/campaigns/begems/sonic.svg';

export const Explainer = memo(function Explainer() {
  return (
    <Layout>
      <Title>Redeem your beGEMS for S tokens</Title>
      <Text>
        Sonic Gems are airdrop points awarded exclusively by Sonic to apps building on its chain.
        They’re distributed based on various factors and are redeemable for S tokens at the end of
        each season.
      </Text>
      <Text>
        Beefy is issuing 80,000 beGEMS each season, representing its share of earned S tokens.
        beGEMS are liquid ERC-20 tokens — transferable, tradeable, and open to speculation. Users
        can earn beGEMS by boosting vaults, providing liquidity in lending markets, or voting for
        beS pairs across Sonic exchanges.
      </Text>
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
    padding: '32px 16px 44px 16px',
    marginBottom: '-12px',
    borderTopRadius: '20px',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.00) 100.07%), rgba(36, 40, 66, 0.40)',
    md: {
      borderRadius: '0',
      padding: '16px 0',
      background: 'none',
      marginBottom: '0',
    },
  },
});

const Title = styled('h1', {
  base: {
    textStyle: 'h1',
    color: 'text.lightest',
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
