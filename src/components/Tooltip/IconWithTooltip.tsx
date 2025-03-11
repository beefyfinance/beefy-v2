import { type CSSProperties, type FC, memo, type ReactNode, type SVGProps, useMemo } from 'react';
import HelpOutline from '../../images/icons/mui/HelpOutline.svg?react';
import { css, type CssStyles } from '@repo/styles/css';
import { TooltipProvider } from './TooltipProvider.tsx';
import { TooltipContent } from './TooltipContent.tsx';
import { useTooltipContext } from './useTooltipContext.ts';
import type { TooltipOptions } from './types.ts';

export type IconWithTooltipProps = Partial<IconProps> &
  TooltipOptions & {
    tooltip: ReactNode;
  };

export const IconWithTooltip = memo(function IconWithTooltip({
  Icon = HelpOutline,
  iconCss,
  iconSize = 20,
  tooltip,
  ...rest
}: IconWithTooltipProps) {
  return (
    <TooltipProvider {...rest}>
      <TooltipIcon Icon={Icon} iconCss={iconCss} iconSize={iconSize} />
      <TooltipContent>{tooltip}</TooltipContent>
    </TooltipProvider>
  );
});

type IconProps = {
  Icon: FC<SVGProps<SVGSVGElement>>;
  iconCss: CssStyles;
  iconSize: number;
};

const iconStyles = css.raw({
  color: 'inherit',
  fontSize: 'var(--tooltip-icon-size, 20px)',
  width: 'var(--tooltip-icon-size, 20px)',
  height: 'var(--tooltip-icon-size, 20px)',
});

const TooltipIcon = memo(function TooltipIcon({
  Icon = HelpOutline,
  iconCss,
  iconSize = 20,
}: IconProps) {
  const { getReferenceProps, refs } = useTooltipContext();
  const style = useMemo(
    () =>
      ({
        '--tooltip-icon-size': `${iconSize}px`,
      }) as CSSProperties,
    [iconSize]
  );
  return (
    <Icon
      {...getReferenceProps()}
      ref={refs.setReference}
      className={css(iconStyles, iconCss)}
      style={style}
    />
  );
});
