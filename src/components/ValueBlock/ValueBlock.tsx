import React, { memo, type ReactNode } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { styles } from './styles';
import { popoverInLinkHack__popoverContainerHandler } from '../../helpers/list-popover-in-link-hack';
import { Popover } from '../Popover';
import { ContentLoading } from '../ContentLoading';

const useStyles = makeStyles(styles);

type ValueBlockProps = {
  label: ReactNode;
  value: ReactNode;
  textContent?: boolean;
  tooltip?: { title?: string; content: ReactNode } | undefined;
  usdValue?: ReactNode;
  loading?: boolean;
  blurred?: boolean;
  labelClassName?: string;
  valueClassName?: string;
  priceClassName?: string;
};

export const ValueBlock = memo(function ValueBlock({
  label,
  value,
  textContent = true,
  tooltip,
  usdValue,
  loading = false,
  blurred = false,
  labelClassName,
  valueClassName,
  priceClassName,
}: ValueBlockProps) {
  const classes = useStyles();
  return (
    <>
      {tooltip ? (
        <div
          className={classes.tooltipLabel}
          onClick={popoverInLinkHack__popoverContainerHandler}
          onTouchStart={popoverInLinkHack__popoverContainerHandler}
        >
          <div className={clsx(classes.label, labelClassName)}>{label}</div>
          <div className={classes.tooltipHolder}>
            <Popover title={tooltip.title}>{tooltip.content}</Popover>
          </div>
        </div>
      ) : (
        <div className={clsx(classes.label, labelClassName)}>{label}</div>
      )}

      {textContent ? (
        <div
          className={clsx(classes.value, valueClassName, {
            [classes.blurred]: blurred,
          })}
        >
          {!loading ? <>{blurred ? '....' : value}</> : <ContentLoading />}
        </div>
      ) : !loading ? (
        <>{blurred ? '....' : value}</>
      ) : (
        <Box className={classes.noTextContentLoader}>
          <ContentLoading />
        </Box>
      )}

      {usdValue && (
        <div
          className={clsx(classes.price, priceClassName, {
            [classes.blurred]: blurred,
          })}
        >
          {!loading ? <>{blurred ? '...' : usdValue}</> : <ContentLoading />}
        </div>
      )}
    </>
  );
});
