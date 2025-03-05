import { Fragment, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type InterestTooltipContentProps = {
  rows: {
    label: string | string[];
    value: string;
    labelTextParams?: Record<string, string>;
  }[];
};

export const InterestTooltipContent = memo(function InterestTooltipContent({
  rows,
}: InterestTooltipContentProps) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.rows}>
      {rows.map(({ label, value, labelTextParams }) => (
        <Fragment key={typeof label === 'string' ? label : label[0]}>
          <div className={classes.label}>{t(label, labelTextParams)}</div>
          <div className={classes.value}>{t(value)}</div>
        </Fragment>
      ))}
    </div>
  );
});
