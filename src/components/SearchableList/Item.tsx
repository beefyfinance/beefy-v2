import type { FC } from 'react';
import { memo, useCallback } from 'react';
import { css } from '@repo/styles/css';
import ChevronRight from '../../images/icons/mui/ChevronRight.svg?react';

export type ItemInnerProps<V extends string = string> = {
  value: V;
};

type ItemProps<TValue extends string = string> = {
  value: TValue;
  onSelect: (value: TValue) => void;
  EndAdornmentComponent?: FC<ItemInnerProps<TValue>>;
  ItemInnerComponent?: FC<ItemInnerProps<TValue>>;
};

export const Item = memo(function Item<TValue extends string = string>({
  value,
  onSelect,
  ItemInnerComponent,
  EndAdornmentComponent,
}: ItemProps<TValue>) {
  const handleClick = useCallback(() => {
    onSelect(value);
  }, [value, onSelect]);

  return (
    <button type="button" onClick={handleClick} className={buttonClass}>
      {ItemInnerComponent ?
        <ItemInnerComponent value={value} />
      : value}
      <div className={endAdornmentClass}>
        {EndAdornmentComponent ?
          <EndAdornmentComponent value={value} />
        : <ChevronRight className={arrowClass} />}
      </div>
    </button>
  );
});

const buttonClass = css({
  textStyle: 'body.medium',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  color: 'text.dark',
  padding: '0 var(--searchable-list-padding-size)',
  '&:hover, &:focus-visible': {
    '--arrow-color': 'white',
    color: 'text.middle',
  },
});

const arrowClass = css({
  color: 'var(--arrow-color, text.middle)',
  height: '24px',
});

const endAdornmentClass = css({
  marginLeft: 'auto',
  display: 'flex',
});
