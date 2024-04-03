import type { FC } from 'react';
import React, { memo, useCallback } from 'react';
import type { ItemInnerProps } from './ItemInner';
import { ItemInner } from './ItemInner';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { itemStyles } from './styles';
import { ChevronRight } from '@material-ui/icons';

const useStyles = makeStyles(itemStyles);

type ItemProps = {
  className?: string;
  value: string;
  onSelect: (value: string) => void;
  EndAdornmentComponent?: FC<ItemInnerProps> | null;
  ItemInnerComponent?: FC<ItemInnerProps>;
};
export const Item = memo<ItemProps>(function Item({
  value,
  onSelect,
  ItemInnerComponent = ItemInner,
  EndAdornmentComponent,
  className,
}) {
  const classes = useStyles();
  const handleClick = useCallback(() => {
    onSelect(value);
  }, [value, onSelect]);

  return (
    <button onClick={handleClick} className={clsx(classes.item, className)}>
      <ItemInnerComponent value={value} />
      <div className={classes.endAdornment}>
        {EndAdornmentComponent && <EndAdornmentComponent value={value} />}
        <ChevronRight className={clsx(classes.arrow)} />
      </div>
    </button>
  );
});
