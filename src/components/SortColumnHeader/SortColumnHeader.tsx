import { css, type CssStyles } from '@repo/styles/css';
import type { FC, ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';

type SortIconProps = {
  direction: 'none' | 'asc' | 'desc';
};
const SortIcon = memo(function SortIcon({ direction }: SortIconProps) {
  return (
    <SortIconContainer xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 9">
      <path
        className={css(direction === 'asc' && styles.sortIconHighlight)}
        d="M2.463.199.097 2.827a.375.375 0 0 0 .279.626h5.066a.375.375 0 0 0 .278-.626L3.355.199a.6.6 0 0 0-.892 0Z"
      />
      <path
        className={css(direction === 'desc' && styles.sortIconHighlight)}
        d="M3.355 8.208 5.72 5.579a.375.375 0 0 0-.278-.626H.376a.375.375 0 0 0-.279.626l2.366 2.629a.601.601 0 0 0 .892 0Z"
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
    fill: 'text.light',
  }),
};

const SortIconContainer = styled('svg', {
  base: {
    marginLeft: '8px',
    width: '9px',
    height: '12px',
    fill: 'currentColor',
    display: 'block',
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
    padding: '0',
    cursor: 'pointer',
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
