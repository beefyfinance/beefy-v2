import { makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { styles } from './styles';
import ContentLoader from 'react-content-loader';
import {
  popoverInLinkHack__popoverContainerHandler,
  popoverInLinkHack__popoverContainerStyle,
} from '../../helpers/list-popover-in-link-hack';
import { Popover } from '../Popover';

const useStyles = makeStyles(styles as any);

const ContentLoading = ({ backgroundColor = '#313759', foregroundColor = '#8585A6' }) => {
  return (
    <ContentLoader
      width={64}
      height={16}
      viewBox="0 0 64 16"
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    >
      <rect x="0" y="0" width="64" height="16" />
    </ContentLoader>
  );
};

function ValueText({
  value,
  loading = false,
  blurred = false,
}: {
  value: ReactNode;
  loading?: boolean;
  blurred?: boolean;
}) {
  const classes = useStyles();

  return (
    <>
      {!loading ? (
        <span
          className={clsx({
            [classes.value]: true,
            [classes.blurred]: blurred,
          })}
        >
          {blurred ? '....' : value}
        </span>
      ) : (
        <ContentLoading />
      )}
    </>
  );
}

function ValuePrice({
  value,
  loading = false,
  blurred = false,
}: {
  value: ReactNode;
  loading?: boolean;
  blurred?: boolean;
}) {
  const classes = useStyles();
  return (
    <>
      {!loading ? (
        <span
          className={clsx({
            [classes.price]: true,
            [classes.blurred]: blurred,
          })}
        >
          {blurred ? '...' : value}
        </span>
      ) : (
        <ContentLoading />
      )}
    </>
  );
}

export function ValueBlock({
  label,
  value,
  textContent = true,
  tooltip,
  usdValue,
  loading = false,
  blurred = false,
}: {
  label: ReactNode;
  value: ReactNode;
  textContent?: boolean;
  tooltip?: { title?: string; content: ReactNode };
  usdValue?: ReactNode;
  loading?: boolean;
  blurred?: boolean;
}) {
  const classes = useStyles();
  return (
    <>
      {tooltip ? (
        <div
          className={classes.tooltipLabel}
          onClick={popoverInLinkHack__popoverContainerHandler}
          onTouchStart={popoverInLinkHack__popoverContainerHandler}
          style={popoverInLinkHack__popoverContainerStyle}
        >
          <Typography className={classes.label}>{label}</Typography>
          <div className={classes.tooltipHolder}>
            <Popover title={tooltip.title}>{tooltip.content}</Popover>
          </div>
        </div>
      ) : (
        <Typography className={classes.label}>{label}</Typography>
      )}
      {textContent ? (
        <Typography className={classes.value}>
          <ValueText loading={loading} blurred={blurred} value={value} />
        </Typography>
      ) : (
        value
      )}

      {usdValue && (
        <Typography className={classes.label}>
          <ValuePrice loading={loading} blurred={blurred} value={usdValue} />
        </Typography>
      )}
    </>
  );
}
