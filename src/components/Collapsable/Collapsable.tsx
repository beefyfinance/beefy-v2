import ExpandLess from '../../images/icons/mui/ExpandLess.svg?react';
import ExpandMore from '../../images/icons/mui/ExpandMore.svg?react';
import type { MouseEventHandler, ReactNode } from 'react';
import { memo, useCallback, useState } from 'react';
import { css, cva, type RecipeVariantProps } from '@repo/styles/css';

type CollapsableProps = {
  openByDefault?: boolean;
  children: ReactNode;
  title: ReactNode;
} & CollapseRecipeProps;

export const Collapsable = memo<CollapsableProps>(function Collapsable({
  openByDefault = false,
  children,
  title,
  ...recipeProps
}) {
  const [open, setOpen] = useState<boolean>(openByDefault);
  const collapsableStyles = collapseRecipe(recipeProps);
  const handleCollapse = useCallback(() => {
    setOpen(prevStatus => !prevStatus);
  }, [setOpen]);
  const Icon = open ? ExpandLess : ExpandMore;

  return (
    <div className={collapsableStyles}>
      <Header onClick={handleCollapse} variant={recipeProps.variant} open={open}>
        {title}
        <Icon className={iconStyles} />
      </Header>
      {open && <Content variant={recipeProps.variant} children={children} />}
    </div>
  );
});

const collapseRecipe = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderRadius: '12px',
    padding: '16px',
    md: {
      padding: '24px',
    },
  },
  variants: {
    variant: {
      transparent: {},
      light: {
        background: 'background.content.light',
      },
      primary: {
        background: 'background.content',
      },
      card: {
        background: 'background.content.light',
        gap: '0',
      },
    },
  },
  defaultVariants: {
    variant: 'transparent',
  },
});

type CollapseRecipeProps = NonNullable<RecipeVariantProps<typeof collapseRecipe>>;

const contentRecipe = cva({
  base: {},
  variants: {
    variant: {
      transparent: {},
      light: {},
      primary: {},
      card: {
        padding: '24px',
      },
    },
  },
  defaultVariants: {
    variant: 'transparent',
  },
});

type ContentRecipeProps = NonNullable<RecipeVariantProps<typeof contentRecipe>>;

const Content = memo(function Header({
  variant,
  ...props
}: {
  children: ReactNode;
} & ContentRecipeProps) {
  return <div className={contentRecipe({ variant })} {...props} />;
});

const headerRecipe = cva({
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderRadius: '12px',
  },
  variants: {
    variant: {
      transparent: {},
      light: {},
      primary: {},
      card: {
        backgroundColor: 'background.content.dark',
        padding: '24px',
      },
    },
    open: {
      true: {
        borderRadius: '12px 12px 0 0',
      },
    },
  },
  defaultVariants: {
    variant: 'transparent',
  },
});

type HeaderRecipeProps = NonNullable<RecipeVariantProps<typeof headerRecipe>>;

const Header = memo(function Header({
  variant,
  open,
  ...props
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
} & HeaderRecipeProps) {
  return <button type="button" className={headerRecipe({ variant, open })} {...props} />;
});

const iconStyles = css({
  fill: 'text.middle',
});
