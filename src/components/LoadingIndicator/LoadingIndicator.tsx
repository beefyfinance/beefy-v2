import { memo } from 'react';
import { css, type CssStyles } from '@repo/styles/css';
import { useTranslation } from 'react-i18next';
import techLoader from '../../images/tech-loader.gif';

export type LoadingIndicatorProps = {
  text?: string;
  css?: CssStyles;
  height?: number;
  iconSize?: number;
};
export const LoadingIndicator = memo(function LoadingIndicator({
  text,
  height,
  iconSize = 80,
}: LoadingIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div className={containerClass} style={height ? { minHeight: height } : undefined}>
      <img
        src={techLoader}
        height={iconSize}
        width={iconSize}
        alt=""
        aria-hidden={true}
        className={iconClass}
      />
      <div className={textClass}>{text ?? t('Loading')}</div>
    </div>
  );
});

const containerClass = css({
  display: 'flex',
  width: '100%',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 'inherit',
});

const iconClass = css({
  marginBottom: '16px',
});

const textClass = css({
  textStyle: 'subline',
  color: 'text.dark',
});
