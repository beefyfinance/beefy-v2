import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import { ActionConnect } from '../../../vault/components/Actions/Boosts/ActionConnectSwitch.tsx';
import WalletIcon from '../../../../images/icons/wallet2.svg?react';

export const ConnectWallet = memo(function ConnectWallet() {
  return (
    <Box>
      <Circle>
        <WalletIcon />
      </Circle>
      <h3>Connect your wallet</h3>
      <Text>To view your beGEMS points and position on the leaderboard</Text>
      <Buttons>
        <ActionConnect />
      </Buttons>
    </Box>
  );
});

const Box = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    padding: '36px 24px 32px 24px',
    sm: {
      position: 'relative',
      borderRadius: '24px',
      background: '{colors.darkBlue.70}',
    },
  },
});

const Circle = styled('div', {
  base: {
    width: '106px',
    height: '106px',
    borderRadius: '50%',
    background: 'buttons.success.background',
    color: 'buttons.success.color',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
});

const Text = styled('p', {
  base: {
    color: 'text.middle',
    marginTop: '8px',
  },
});

const Buttons = styled('div', {
  base: {
    marginTop: '24px',
    width: '100%',
  },
});
