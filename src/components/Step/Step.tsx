import { memo, type ReactNode, useMemo } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import BackArrow from '../../images/back-arrow.svg?react';

const useStyles = legacyMakeStyles(styles);

export type StepType = 'bridge' | 'onRamp';

export type StepProps = {
  stepType: StepType;
  title?: string;
  onBack?: () => void;
  children: ReactNode;
  titleAdornment?: ReactNode;
  contentCss?: CssStyles;
  noPadding?: boolean;
};

export const Step = memo(function Step({
  stepType,
  title,
  titleAdornment,
  onBack,
  children,
  contentCss,
  noPadding = false,
}: StepProps) {
  const classes = useStyles();
  const cardStyle = useMemo(
    () => ({ height: stepType === 'bridge' ? '676px' : '648px' }),
    [stepType]
  );

  return (
    <div className={classes.container} style={cardStyle}>
      {title ?
        <div className={classes.titleBar}>
          {onBack !== undefined ?
            <button type="button" onClick={onBack} className={classes.backButton}>
              <BackArrow className={classes.backIcon} />
            </button>
          : null}
          <div>{title}</div>
          {titleAdornment ?
            <div className={classes.adornment}>{titleAdornment}</div>
          : null}
        </div>
      : null}
      <div className={css(styles.content, contentCss, noPadding && styles.noPadding)}>
        {children}
      </div>
    </div>
  );
});
