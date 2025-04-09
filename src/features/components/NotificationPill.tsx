import { css, cva, type RecipeVariant } from '@repo/styles/css';
import { type FC, memo, type SVGProps } from 'react';
import ConfirmationIcon from '../../images/icons/mark-marked.svg?react';
import TeaserIcon from '../../images/icons/clock.svg?react';

const pillRecipe = cva({
  base: {
    padding: '2px 10px',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: '0',
    gap: '4px',
    color: 'colorPalette.primary',
    backgroundColor: 'colorPalette.background',
    textStyle: 'body.sm.medium',
    borderRadius: '36px',
  },
  variants: {
    mode: {
      confirmation: {
        colorPalette: 'notification.confirmation',
      },
      teaser: {
        colorPalette: 'notification.teaser',
      },
    },
  },
  defaultVariants: {
    mode: 'confirmation',
  },
});

export type Mode = RecipeVariant<typeof pillRecipe>['mode'];

const iconClass = css({
  width: '12px',
  height: '12px',
  fill: 'currentColor',
});

const defaultIcons: Record<Mode, FC<SVGProps<SVGSVGElement>>> = {
  confirmation: ConfirmationIcon,
  teaser: TeaserIcon,
};

type NotificationPillProps = {
  text?: string;
  Icon?: FC<SVGProps<SVGSVGElement>>;
  iconPosition?: 'left' | 'right';
  mode?: Mode;
};

export const NotificationPill = memo(function NotificationPill({
  text,
  Icon,
  iconPosition = 'left',
  mode = 'confirmation',
}: NotificationPillProps) {
  const IconComponent = Icon || defaultIcons[mode];

  return (
    <div className={pillRecipe({ mode })}>
      {iconPosition === 'left' && <IconComponent className={iconClass} />}
      <span>{text}</span>
      {iconPosition === 'right' && <IconComponent className={iconClass} />}
    </div>
  );
});
