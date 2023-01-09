import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { ReactComponent as ArrowDown } from '../../../../../../images/icons/arrowDown.svg';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type QuoteDownArrowProps = {
  className?: string;
};
export const QuoteArrowDivider = memo<QuoteDownArrowProps>(function ({ className }) {
  const classes = useStyles();
  return (
    <div className={clsx(classes.holder, className)}>
      <ArrowDown className={classes.arrow} />
    </div>
  );
});
