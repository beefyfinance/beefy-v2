import { css, type CssStyles } from '@repo/styles/css';
import type { FC, ReactNode } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import SortArrow from '../../images/icons/sortArrow.svg?react';

type SortIconProps = {
  direction: 'none' | 'asc' | 'desc';
};
const SortIcon = memo(function SortIcon({ direction }: SortIconProps) {
  const isActive = useMemo(() => {
    return direction !== 'none';
  }, [direction]);

  return (
    <SortIconContainer>
      <SortArrow
        className={css(isActive && styles.sortIconHighlight, direction === 'asc' && styles.asc)}
      />
    </SortIconContainer>
  );
});

type SortColumnHeaderProps<TValue extends string = string> = {
  label: string;
  sortKey: TValue;
  sorted: 'none' | 'asc' | 'desc';
  onChange?: (field: TValue) => void;
  tooltip?: ReactNode;
  css?: CssStyles;
  ExtraComponent?: FC;
};

export const SortColumnHeader = memo(function SortColumnHeader<TValue extends string = string>({
  label,
  sortKey,
  sorted,
  onChange,
  tooltip,
  css: cssProp,
  ExtraComponent,
}: SortColumnHeaderProps<TValue>) {
  const { t } = useTranslation();
  const handleChange = useCallback(() => {
    if (onChange) {
      onChange(sortKey);
    }
  }, [sortKey, onChange]);

  return (
    <>
      {ExtraComponent ?
        <SortColumn className={css(cssProp)}>
          <ExtraComponent />
          <SortColumnButton type="button" onClick={handleChange}>
            {t(label)}
            {tooltip}
            <SortIcon direction={sorted} />
          </SortColumnButton>
        </SortColumn>
      : <SortColumnButton type="button" className={css(cssProp)} onClick={handleChange}>
          {t(label)}
          {tooltip}
          <SortIcon direction={sorted} />
        </SortColumnButton>
      }
    </>
  );
});

const styles = {
  sortIconHighlight: css.raw({
    color: 'text.light',
  }),
  asc: css.raw({
    transform: 'rotate(180deg)',
  }),
};

const SortIconContainer = styled('div', {
  base: {
    width: '9px',
    height: '12px',
    display: 'flex',
    color: 'text.dark',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const SortColumnButton = styled('button', {
  base: {
    textStyle: 'subline.sm',
    color: 'text.dark',
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
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    justifyContent: 'flex-end',
  },
});
