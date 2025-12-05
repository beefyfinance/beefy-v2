import { memo, type ReactNode } from 'react';
import { useCollapse } from '../../../../components/Collapsable/hooks.ts';
import { styled } from '@repo/styles/jsx';

type OtherProps = {
  title: string;
  children: ReactNode;
};
export const Other = memo(function ({ title, children }: OtherProps) {
  const { open, handleToggle, Icon } = useCollapse();
  return (
    <Layout>
      <Header onClick={handleToggle}>
        <Title>{title}</Title> <Icon />
      </Header>
      {open && children}
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
});

const Header = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    width: '100%',
    padding: '12px 16px',
    background: 'darkBlue.60',
    borderRadius: '8px',
    color: 'text.dark',
  },
});

const Title = styled('div', {
  base: {
    flexGrow: 1,
    color: 'text.lightest',
    textStyle: 'body.medium',
  },
});
