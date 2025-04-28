import type { ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import type { StyledVariantProps } from '@repo/styles/types';
import { SortIcon } from './SortIcon.tsx';

export type SortColumnHeaderProps<TValue extends string = string> = {
  label: string;
  sortKey: TValue;
  sorted: 'none' | 'asc' | 'desc';
  onChange?: (field: TValue) => void;
  before?: ReactNode;
} & StyledVariantProps<typeof SortColumn>;

export const SortColumnHeader = memo(function SortColumnHeader<TValue extends string = string>({
  label,
  sortKey,
  sorted,
  onChange,
  before,
  ...rest
}: SortColumnHeaderProps<TValue>) {
  const { t } = useTranslation();
  const handleChange = useCallback(() => {
    if (onChange) {
      onChange(sortKey);
    }
  }, [sortKey, onChange]);

  return (
    <SortColumn {...rest} show={rest.show} selected={sorted !== 'none'}>
      {before}
      <SortColumnButton type="button" onClick={handleChange}>
        {t(label)}
        <SortIcon direction={sorted} />
      </SortColumnButton>
    </SortColumn>
  );
});

const SortColumnButton = styled('button', {
  base: {
    textStyle: 'subline.sm',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    textAlign: 'right',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    gap: '8px',
    padding: '0',
    '&:hover': {
      color: 'text.light',
    },
  },
});

const SortColumn = styled('div', {
  base: {
    color: 'text.dark',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  variants: {
    show: {
      md: {
        display: 'none',
        md: {
          display: 'flex',
        },
      },
      lg: {
        display: 'none',
        lg: {
          display: 'flex',
        },
      },
    },
    align: {
      left: {
        justifyContent: 'flex-start',
        textAlign: 'left',
      },
      right: {
        justifyContent: 'flex-end',
        textAlign: 'right',
      },
    },
    selected: {
      true: {
        color: 'text.light',
      },
    },
  },
  defaultVariants: {
    align: 'right',
  },
});
