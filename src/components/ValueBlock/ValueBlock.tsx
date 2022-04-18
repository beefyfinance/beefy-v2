import React from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { styles } from './styles';
import { popoverInLinkHack__popoverContainerHandler } from '../../helpers/list-popover-in-link-hack';
import { Popover } from '../Popover';
import { ContentLoading } from '../ContentLoading';

const useStyles = makeStyles(styles as any);

export function ValueBlock({
  label,
  value,
  textContent = true,
  tooltip,
  usdValue,
  loading = false,
  blurred = false,
  variant,
}: {
  label: ReactNode;
  value: ReactNode;
  textContent?: boolean;
  tooltip?: { title?: string; content: ReactNode };
  usdValue?: ReactNode;
  loading?: boolean;
  blurred?: boolean;
  variant?: 'small' | 'large';
}) {
  const classes = useStyles();
  return (
    <>
      {tooltip ? (
        <div
          className={classes.tooltipLabel}
          onClick={popoverInLinkHack__popoverContainerHandler}
          onTouchStart={popoverInLinkHack__popoverContainerHandler}
        >
          <Typography
            className={clsx({
              [classes.label]: true,
              large: variant === 'large',
            })}
          >
            {label}
          </Typography>
          <div className={classes.tooltipHolder}>
            <Popover title={tooltip.title}>{tooltip.content}</Popover>
          </div>
        </div>
      ) : (
        <Typography
          className={clsx({
            [classes.label]: true,
            large: variant === 'large',
          })}
        >
          {label}
        </Typography>
      )}

      {textContent ? (
        <Typography
          className={clsx({
            [classes.value]: true,
            large: variant === 'large',
            [classes.blurred]: blurred,
          })}
        >
          {!loading ? <>{blurred ? '....' : value}</> : <ContentLoading />}
        </Typography>
      ) : !loading ? (
        <>{blurred ? '....' : value}</>
      ) : (
        <Box className={classes.noTextContentLoader}>
          <ContentLoading />
        </Box>
      )}

      {usdValue && (
        <Typography
          className={clsx({
            [classes.price]: true,
            large: variant === 'large',
            [classes.blurred]: blurred,
          })}
        >
          {!loading ? <>{blurred ? '...' : usdValue}</> : <ContentLoading />}
        </Typography>
      )}
    </>
  );
}
