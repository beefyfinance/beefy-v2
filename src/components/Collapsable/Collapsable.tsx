import type { MouseEventHandler, ReactNode } from 'react';
import { memo } from 'react';
import { css, type CssStyles, cva, type RecipeVariantProps } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { useCollapse } from './hooks.ts';

type CollapsableProps = {
  openByDefault?: boolean;
  children: ReactNode;
  title: ReactNode;
  collapsableClass?: CssStyles;
  titleClass?: CssStyles;
  contentClass?: CssStyles;
} & CollapseRecipeProps;

export const Collapsable = memo<CollapsableProps>(function Collapsable({
  openByDefault = false,
  children,
  title,
  titleClass,
  contentClass,
  collapsableClass,
  ...recipeProps
}) {
  const { open, handleToggle, Icon } = useCollapse(openByDefault);

  return (
    <CollapsableContainer variant={recipeProps.variant} className={css(collapsableClass)}>
      <Header
        className={titleClass}
        onClick={handleToggle}
        variant={recipeProps.variant}
        open={open}
      >
        {title}
        <Icon className={iconStyles} />
      </Header>
      {open && (
        <CollapsableContent
          variant={recipeProps.variant}
          children={children}
          className={contentClass}
        />
      )}
    </CollapsableContainer>
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
      noPadding: {
        padding: '0px',
        md: {
          padding: '0px',
        },
      },
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

const CollapsableContainer = styled('div', collapseRecipe);

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
      noPadding: {
        padding: '0',
      },
    },
  },
  defaultVariants: {
    variant: 'transparent',
  },
});

const Content = styled('div', contentRecipe);

type ContentRecipeProps = NonNullable<RecipeVariantProps<typeof contentRecipe>>;

const CollapsableContent = memo(function CollapsableContent({
  variant,
  className,
  ...props
}: {
  children: ReactNode;
  className?: CssStyles;
} & ContentRecipeProps) {
  return <Content variant={variant} className={css(className)} {...props} />;
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
      noPadding: {
        padding: '0',
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

const TriggerButton = styled('button', headerRecipe);

type HeaderRecipeProps = NonNullable<RecipeVariantProps<typeof headerRecipe>>;

const Header = memo(function Header({
  variant,
  open,
  className,
  ...props
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: CssStyles;
} & HeaderRecipeProps) {
  return (
    <TriggerButton
      type="button"
      variant={variant}
      open={open}
      className={css(className)}
      {...props}
    />
  );
});

const iconStyles = css({
  fill: 'text.middle',
  height: '20px',
  width: '20px',
});
