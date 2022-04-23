import { Fragment, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type InterestTooltipContentProps = {
  rows: { label: string; value: string }[];
};

export const InterestTooltipContent = memo<InterestTooltipContentProps>(
  function InterestTooltipContent({ rows }) {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
      <div className={classes.rows}>
        {rows.map(({ label, value }) => (
          <Fragment key={label}>
            <div className={classes.label}>{t(label)}</div>
            <div className={classes.value}>{t(value)}</div>
          </Fragment>
        ))}
      </div>
    );
  }
);
