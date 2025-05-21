import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import type { StyledVariantProps } from '@repo/styles/types';
import { type FC, memo, type ReactNode, type SVGProps } from 'react';
import { TextLoader } from '../TextLoader/TextLoader.tsx';
import { DivWithTooltip } from '../Tooltip/DivWithTooltip.tsx';

type LayoutVariantProps = StyledVariantProps<typeof Layout>;
type ValueHolderVariantProps = StyledVariantProps<typeof ValueHolder>;

export type VaultValueStatProps = {
  /** label to show on mobile (when there are no colum headers) */
  label: string;
  /** hide the mobile label */
  hideLabel?: boolean;
  /** tooltip content to show for entire stat */
  tooltip?: ReactNode;
  /** value for line one */
  value: ReactNode;
  /** value for line 2 */
  subValue?: ReactNode;
  /** set to true to show loading indicator for the sub value slot also */
  expectSubValue?: boolean;
  /** blur the values */
  blur?: boolean;
  /** show loading indicator instead of values */
  loading?: boolean;
  /** when true, the main value and icon will get the boost color */
  boosted?: boolean;
  /** icon to show before the main value */
  Icon?: FC<SVGProps<SVGSVGElement>>;
} & Pick<LayoutVariantProps, 'layout' | 'align' | 'altLayout' | 'altAlign' | 'altFrom'> &
  Pick<ValueHolderVariantProps, 'textWrap'>;

export const VaultValueStat = memo(function VaultValueStat({
  label,
  tooltip,
  value,
  subValue,
  expectSubValue = false,
  blur = false,
  loading = false,
  boosted,
  hideLabel = false,
  Icon,
  textWrap = true,
  ...rest
}: VaultValueStatProps) {
  const showSubValue = expectSubValue || !!subValue;

  return (
    <Layout {...rest}>
      {!hideLabel && <Label>{label}</Label>}
      <Values tooltip={tooltip} disabled={!tooltip}>
        <ValueHolder kind="primary" textWrap={textWrap} boosted={boosted}>
          {loading ?
            <TextLoader placeholder="Loading..." />
          : value ?
            <>
              {Icon && <Icon className={iconClass} />}
              <ValueContent blur={blur}>{value}</ValueContent>
            </>
          : '???'}
        </ValueHolder>
        {showSubValue && (
          <ValueHolder kind="secondary" textWrap={textWrap}>
            {loading ?
              <TextLoader placeholder="Loading..." />
            : subValue ?
              <ValueContent strike={boosted} blur={blur}>
                {subValue}
              </ValueContent>
            : '???'}
          </ValueHolder>
        )}
      </Values>
    </Layout>
  );
});

const iconClass = css({
  width: '0.875em',
  height: '0.875em',
  color: 'inherit',
});

const alignLeft = {
  alignItems: 'flex-start',
  textAlign: 'left',
} as const;

const alignRight = {
  alignItems: 'flex-end',
  textAlign: 'right',
} as const;

const layoutHorizontal = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
} as const;

const layoutVertical = {
  flexDirection: 'column',
  justifyContent: 'flex-start',
} as const;

const Layout = styled('div', {
  base: {
    display: 'flex',
    gap: '0 6px',
  },
  variants: {
    layout: {
      horizontal: layoutHorizontal,
      vertical: layoutVertical,
    },
    align: {
      left: alignLeft,
      right: alignRight,
    },
    altLayout: {
      horizontal: {},
      vertical: {},
    },
    altAlign: {
      left: {},
      right: {},
    },
    altFrom: {
      sm: {},
      md: {},
      lg: {},
      xl: {},
    },
  },
  compoundVariants: [
    {
      altLayout: 'horizontal',
      altFrom: 'sm',
      css: {
        sm: layoutHorizontal,
      },
    },
    {
      altLayout: 'horizontal',
      altFrom: 'md',
      css: {
        md: layoutHorizontal,
      },
    },
    {
      altLayout: 'horizontal',
      altFrom: 'lg',
      css: {
        lg: layoutHorizontal,
      },
    },
    {
      altLayout: 'horizontal',
      altFrom: 'xl',
      css: {
        xl: layoutHorizontal,
      },
    },
    {
      altLayout: 'vertical',
      altFrom: 'sm',
      css: {
        sm: layoutVertical,
      },
    },
    {
      altLayout: 'vertical',
      altFrom: 'md',
      css: {
        md: layoutVertical,
      },
    },
    {
      altLayout: 'vertical',
      altFrom: 'lg',
      css: {
        lg: layoutVertical,
      },
    },
    {
      altLayout: 'vertical',
      altFrom: 'xl',
      css: {
        xl: layoutVertical,
      },
    },
    {
      altAlign: 'left',
      altFrom: 'sm',
      css: {
        sm: alignLeft,
      },
    },
    {
      altAlign: 'left',
      altFrom: 'md',
      css: {
        md: alignLeft,
      },
    },
    {
      altAlign: 'left',
      altFrom: 'lg',
      css: {
        lg: alignLeft,
      },
    },
    {
      altAlign: 'left',
      altFrom: 'xl',
      css: {
        xl: alignLeft,
      },
    },
    {
      altAlign: 'right',
      altFrom: 'sm',
      css: {
        sm: alignRight,
      },
    },
    {
      altAlign: 'right',
      altFrom: 'md',
      css: {
        md: alignRight,
      },
    },
    {
      altAlign: 'right',
      altFrom: 'lg',
      css: {
        lg: alignRight,
      },
    },
    {
      altAlign: 'right',
      altFrom: 'xl',
      css: {
        xl: alignRight,
      },
    },
  ],
  defaultVariants: {
    align: 'left',
    layout: 'vertical',
  },
});

const Label = styled('div', {
  base: {
    color: 'text.dark',
    display: 'inline-flex',
    flexDirection: 'row',
    maxWidth: '100%',
    gap: 'inherit',
    alignItems: 'inherit',
    textAlign: 'inherit',
  },
  variants: {
    to: {
      sm: {
        sm: {
          display: 'none',
        },
      },
      md: {
        md: {
          display: 'none',
        },
      },
      lg: {
        lg: {
          display: 'none',
        },
      },
    },
    textStyle: {
      'body.sm': {
        textStyle: 'body.sm',
      },
      'subline.sm': {
        textStyle: 'subline.sm',
      },
    },
  },
  defaultVariants: {
    textStyle: 'subline.sm',
    to: 'lg', // lg on home page, md on dashboard
  },
});

const Values = styled(DivWithTooltip, {
  base: {
    display: 'inline-flex',
    flexDirection: 'inherit',
    alignItems: 'inherit',
    textAlign: 'inherit',
    gap: 'inherit',
  },
});

const ValueHolder = styled('div', {
  base: {
    display: 'inline-flex',
    flexDirection: 'row',
    maxWidth: '100%',
    gap: 'inherit',
    alignItems: 'center',
  },
  variants: {
    kind: {
      primary: {
        textStyle: 'body.medium',
        color: 'text.middle',
      },
      secondary: {
        textStyle: 'body.sm',
        color: 'text.dark',
      },
    },
    textWrap: {
      false: {
        minWidth: '0',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },
    },
    boosted: {
      true: {
        color: 'text.boosted',
      },
    },
  },
});

const ValueContent = styled('div', {
  base: {
    display: 'inherit',
    flexDirection: 'inherit',
    gap: 'inherit',
    alignItems: 'inherit',
  },
  variants: {
    strike: {
      true: {
        textDecoration: 'line-through',
      },
    },
    blur: {
      true: {
        filter: 'blur(.5rem)',
      },
    },
  },
});
