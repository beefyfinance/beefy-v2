import { DropdownContent } from './DropdownContent.tsx';
import { styled } from '@repo/styles/jsx';
import type { ReactNode } from 'react';

type DetailsDesktopProps = {
  header: ReactNode;
  content: ReactNode;
  footer: ReactNode;
};

export function DetailsDesktop({ header, content, footer }: DetailsDesktopProps) {
  return (
    <DropdownContent>
      {header}
      <Content>{content}</Content>
      <Footer>{footer}</Footer>
    </DropdownContent>
  );
}

const Content = styled('div', {
  base: {
    marginInline: '2px',
  },
});

const Footer = styled('div', {
  base: {
    textStyle: 'body.md',
    color: 'text.middle',
    padding: '10px 12px 12px 12px',
    textAlign: 'left',
  },
});
