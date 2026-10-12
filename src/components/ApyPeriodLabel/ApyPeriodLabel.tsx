import { styled } from '@repo/styles/jsx';
import { memo, useCallback, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubSort } from '../../hooks/useSubSort.ts';

type ApyPeriodLabelProps = {
  type?: 'apy' | 'apr';
};

export const ApyPeriodLabel = memo(function ApyPeriodLabel({ type = 'apy' }: ApyPeriodLabelProps) {
  const { t } = useTranslation();
  const { next, label } = useSubSort('apy');

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      next();
    },
    [next]
  );

  return (
    <Label>
      <Prefix type="button" onClick={handleClick}>
        {label}
      </Prefix>
      <span>{t(type === 'apr' ? 'VaultStat-APR' : 'VaultStat-APY')}</span>
    </Label>
  );
});

const Label = styled('div', {
  base: {
    textStyle: 'subline.sm',
    color: 'text.dark',
    display: 'inline-flex',
    alignItems: 'baseline',
    columnGap: '4px',
    flexWrap: 'wrap',
  },
});

const Prefix = styled('button', {
  base: {
    background: 'none',
    border: 'none',
    padding: '0',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationColor: 'text.underline',
    textUnderlineOffset: '3px',
    textTransform: 'uppercase',
    _hover: {
      color: 'text.light',
    },
  },
});
