import React, { memo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { VaultLabelledStat } from '../VaultLabelledStat';

const useStyles = makeStyles(styles);

export type VaultValueStatProps = {
  label: string;
  tooltip?: ReactNode;
  value: ReactNode;
  subValue?: ReactNode;
  blur?: boolean;
  loading: boolean;
  boosted?: boolean;
};
export const VaultValueStat = memo<VaultValueStatProps>(function VaultValueStat({
  label,
  tooltip,
  value,
  subValue,
  blur,
  loading,
  boosted,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <VaultLabelledStat label={t(label)} tooltip={loading ? null : tooltip}>
      {loading ? (
        '...'
      ) : (
        <>
          <div
            className={clsx(classes.value, {
              [classes.blurValue]: blur,
              [classes.boostedValue]: boosted,
            })}
          >
            {value}
          </div>
          {subValue ? (
            <div
              className={clsx(classes.subValue, {
                [classes.blurValue]: blur,
                [classes.lineThroughValue]: boosted,
              })}
            >
              {subValue}
            </div>
          ) : null}
        </>
      )}
    </VaultLabelledStat>
  );
});
