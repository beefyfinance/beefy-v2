import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { memo, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';

const useStyles = makeStyles(styles);

type SortIconProps = {
  direction: 'none' | 'asc' | 'desc';
};
const SortIcon = memo<SortIconProps>(function SortIcon({ direction }) {
  const classes = useStyles();

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 9" className={classes.sortIcon}>
      <path
        className={direction === 'asc' ? classes.sortIconHighlight : undefined}
        d="M2.463.199.097 2.827a.375.375 0 0 0 .279.626h5.066a.375.375 0 0 0 .278-.626L3.355.199a.6.6 0 0 0-.892 0Z"
      />
      <path
        className={direction === 'desc' ? classes.sortIconHighlight : undefined}
        d="M3.355 8.208 5.72 5.579a.375.375 0 0 0-.278-.626H.376a.375.375 0 0 0-.279.626l2.366 2.629a.601.601 0 0 0 .892 0Z"
      />
    </svg>
  );
});

type SortColumnHeaderProps = {
  label: string;
  sortKey: string;
  sorted: 'none' | 'asc' | 'desc';
  onChange?: (field: string) => void;
  tooltip?: ReactNode;
  className?: string;
};
export const SortColumnHeader = memo<SortColumnHeaderProps>(function SortColumnHeader({
  label,
  sortKey,
  sorted,
  onChange,
  tooltip,
  className,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const handleChange = useCallback(() => {
    onChange(sortKey);
  }, [sortKey, onChange]);

  return (
    <button className={clsx(classes.sortColumn, className)} onClick={handleChange}>
      {t(label)}
      {tooltip}
      <SortIcon direction={sorted} />
    </button>
  );
});
