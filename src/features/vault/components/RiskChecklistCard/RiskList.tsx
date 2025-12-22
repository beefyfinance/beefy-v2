import { memo } from 'react';
import { RiskItem } from './RiskItem.tsx';
import { styled } from '@repo/styles/jsx';

type RiskListProps = {
  risks: string[];
  mode: 'passed' | 'failed';
};

export const RiskList = memo(function ({ risks, mode }: RiskListProps) {
  return (
    <List>
      {risks.map(risk => (
        <RiskItem key={risk} risk={risk} mode={mode} />
      ))}
    </List>
  );
});

const List = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
});
