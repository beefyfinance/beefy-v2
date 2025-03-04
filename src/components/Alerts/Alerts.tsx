import { memo } from 'react';
import ErrorOutline from '../../images/icons/mui/ErrorOutline.svg?react';
import InfoOutlined from '../../images/icons/mui/InfoOutlined.svg?react';
import ReportProblemOutlined from '../../images/icons/mui/ReportProblemOutlined.svg?react';
import { css } from '@repo/styles/css';
import { alertRecipe } from './styles.ts';
import type { AlertProps, AlertVariantProps } from './types.ts';

export const Alert = memo(function Alert({
  IconComponent,
  css: cssProp,
  children,
  variant,
}: AlertProps) {
  const classes = alertRecipe.raw({ variant });

  return (
    <div className={css(classes.alert, cssProp)}>
      <IconComponent className={css(classes.icon)} />
      <div className={css(classes.content)}>{children}</div>
    </div>
  );
});

function makeAlertVariant(staticProps: Pick<AlertProps, 'IconComponent' | 'variant'>) {
  const component = function AlertVariant(props: AlertVariantProps) {
    return <Alert {...staticProps} {...props} />;
  };
  component.displayName = `Alert.${staticProps.variant}`;
  return memo(component);
}

export const AlertInfo = makeAlertVariant({ variant: 'info', IconComponent: InfoOutlined });
export const AlertWarning = makeAlertVariant({ variant: 'warning', IconComponent: ErrorOutline });
export const AlertError = makeAlertVariant({
  variant: 'error',
  IconComponent: ReportProblemOutlined,
});
