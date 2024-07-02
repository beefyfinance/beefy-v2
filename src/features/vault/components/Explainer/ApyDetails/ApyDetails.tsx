import React, { Fragment, memo, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { formatTotalApy } from '../../../../../helpers/format';
import { StatLoader } from '../../../../../components/StatLoader';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  type ApyLabelsType,
  getApyComponents,
  getApyLabelsForType,
} from '../../../../../helpers/apy';
import type { TotalApy } from '../../../../data/reducers/apy';

const useStyles = makeStyles(styles);

export type ApyDetailsProps = {
  values: TotalApy;
  type: ApyLabelsType;
  className?: string;
};

export const ApyDetails = memo<ApyDetailsProps>(function ApyDetails({ values, type, className }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const formatted = useMemo(() => formatTotalApy(values, <StatLoader />), [values]);
  const { yearly } = getApyComponents();
  const hasComponents = useMemo(() => yearly.some(key => !!values[key]), [yearly, values]);
  const isBoosted = !!values.boostedTotalDaily;

  if (!hasComponents && !isBoosted) {
    return null;
  }

  const labels = getApyLabelsForType(type);

  return (
    <div className={clsx(classes.apysContainer, className)}>
      <div className={classes.apyTitle}>{t(labels.breakdown)}</div>
      <div className={classes.apys}>
        <div className={classes.apy}>
          <div className={classes.apyLabel}>
            {t(isBoosted ? labels.boostedTotalApy : labels.totalApy)}
          </div>
          <div className={classes.apyValue}>
            {isBoosted ? formatted.boostedTotalApy : formatted.totalApy}
          </div>
        </div>
        {yearly.map(key => (
          <Fragment key={key}>
            {values[key] ? (
              <div className={classes.apy}>
                <div className={classes.apyLabel}>{t(labels[key])}</div>
                <div className={classes.apyValue}>{formatted[key]}</div>
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
});
