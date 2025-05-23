import { type HTMLStyledProps, styled } from '@repo/styles/jsx';
import { forwardRef, memo, type ReactNode, type Ref } from 'react';
import type { Override } from '../../../features/data/utils/types-utils.ts';

export type SelectDropdownProps = Override<
  HTMLStyledProps<typeof Layout>,
  {
    header?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
  }
>;

export const SelectDropdown = memo(
  forwardRef(function SelectDropdown(
    { header, footer, children, ...rest }: SelectDropdownProps,
    ref: Ref<HTMLDivElement>
  ) {
    return (
      <Layout ref={ref} {...rest}>
        {header && <Header>{header}</Header>}
        <ContentScrollable className={'scrollbar'}>{children}</ContentScrollable>
        {footer && <Footer>{footer}</Footer>}
      </Layout>
    );
  })
);

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    textStyle: 'body.medium',
    zIndex: 'dropdown',
    border: '2px solid {colors.background.content.light}',
    borderRadius: '8px',
    backgroundColor: 'background.content',
    padding: '6px 12px',
    gap: '6px',
    color: 'text.middle',
    maxWidth: '100%',
    maxHeight: '100%',
    outline: 'none',
    marginY: '4px',
  },
  variants: {
    layer: {
      0: {
        zIndex: 'dropdown',
      },
      1: {
        zIndex: 'layer1.dropdown',
      },
      2: {
        zIndex: 'layer2.dropdown',
      },
    },
  },
  defaultVariants: {
    layer: 0,
  },
});

const Header = styled('div', {
  base: {
    flex: '0 0 auto',
  },
});

const ContentScrollable = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    overflowY: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

const Footer = styled('div', {
  base: {
    flex: '0 0 auto',
  },
});
