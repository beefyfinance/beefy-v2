import React, { FC, memo, useCallback } from 'react';
import { ItemInner, ItemInnerProps } from './ItemInner';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { itemStyles } from './styles';
import { ChevronRight } from '@material-ui/icons';

const useStyles = makeStyles(itemStyles);

type ItemProps = {
  className?: string;
  value: string;
  onSelect: (value: string) => void;
  EndAdornementComponent?: FC<ItemInnerProps> | null;
  ItemInnerComponent?: FC<ItemInnerProps>;
};
export const Item = memo<ItemProps>(function ({
  value,
  onSelect,
  ItemInnerComponent = ItemInner,
  EndAdornementComponent,
  className,
}) {
  const classes = useStyles();
  const handleClick = useCallback(() => {
    onSelect(value);
  }, [value, onSelect]);

  return (
    <button onClick={handleClick} className={clsx(classes.item, className)}>
      <ItemInnerComponent value={value} />
      <div className={classes.endAdornement}>
        {EndAdornementComponent && <EndAdornementComponent value={value} />}
        <ChevronRight className={clsx(classes.arrow)} />
      </div>
    </button>
  );
});
