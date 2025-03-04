import type { FC } from 'react';
import { memo, useCallback } from 'react';
import type { ItemInnerProps } from './ItemInner.tsx';
import { ItemInner } from './ItemInner.tsx';
import { css, type CssStyles, cx } from '@repo/styles/css';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { itemStyles } from './styles.ts';
import ChevronRight from '../../images/icons/mui/ChevronRight.svg?react';

const useStyles = legacyMakeStyles(itemStyles);

type ItemProps<TValue extends string = string> = {
  css?: CssStyles;
  value: TValue;
  onSelect: (value: TValue) => void;
  EndAdornmentComponent?: FC<ItemInnerProps<TValue>> | null;
  ItemInnerComponent?: FC<ItemInnerProps<TValue>>;
};

export const Item = memo(function Item<TValue extends string = string>({
  value,
  onSelect,
  ItemInnerComponent = ItemInner,
  EndAdornmentComponent,
  css: cssProp,
}: ItemProps<TValue>) {
  const classes = useStyles();
  const handleClick = useCallback(() => {
    onSelect(value);
  }, [value, onSelect]);

  return (
    <button type="button" onClick={handleClick} className={css(itemStyles.item, cssProp)}>
      <ItemInnerComponent value={value} />
      <div className={classes.endAdornment}>
        {EndAdornmentComponent ? (
          <EndAdornmentComponent value={value} />
        ) : (
          <ChevronRight className={cx('item-arrow', classes.arrow)} />
        )}
      </div>
    </button>
  );
});
