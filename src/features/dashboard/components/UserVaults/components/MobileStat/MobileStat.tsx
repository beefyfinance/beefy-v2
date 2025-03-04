import { css, type CssStyles } from '@repo/styles/css';
import { memo, type ReactNode } from 'react';
import { styles } from './styles.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';

const useStyles = legacyMakeStyles(styles);

interface MobileStatsProps {
  label: string;
  value: string | ReactNode;
  valueCss?: CssStyles;
}

export const MobileStat = memo(function MobileStat({ label, value, valueCss }: MobileStatsProps) {
  const classes = useStyles();
  return (
    <div className={classes.mobileStat}>
      <div>{label}</div> <span className={css(styles.value, valueCss)}>{value}</span>
    </div>
  );
});
