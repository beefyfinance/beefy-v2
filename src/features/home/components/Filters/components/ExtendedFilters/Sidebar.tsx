import { memo } from 'react';
import { ExtendedFilters } from './ExtendedFilters.tsx';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import CloseOutlined from '../../../../../../images/icons/mui/CloseOutlined.svg?react';
import { Drawer } from '../../../../../../components/Modal/Drawer.tsx';
import { styled } from '@repo/styles/jsx';

export type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export const Sidebar = memo<SidebarProps>(function Sidebar({ open, onClose }) {
  const { t } = useTranslation();

  return (
    <Drawer scrollable={false} open={open} onClose={onClose}>
      <Layout>
        <Header>
          <Title>{t('Filter-Filters')}</Title>
          <CloseIconButton onClick={onClose}>
            <CloseOutlined />
          </CloseIconButton>
        </Header>
        <Main>
          <ExtendedFilters desktopView={false} />
        </Main>
        <Footer>
          <Button fullWidth={true} borderless={true} onClick={onClose} variant="success">
            {t('Filter-Close')}
          </Button>
        </Footer>
      </Layout>
    </Drawer>
  );
});

const Layout = styled('div', {
  base: {
    backgroundColor: 'background.content',
    height: '100vh',
    maxHeight: '100%',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
  },
});

const Header = styled('div', {
  base: {
    textStyle: 'h2',
    backgroundColor: 'background.content.dark',
    color: 'text.light',
    padding: '24px',
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
});

const Title = styled('div', {
  base: {
    marginRight: '24px',
  },
});

const CloseIconButton = styled('button', {
  base: {
    marginLeft: 'auto',
    color: 'text.dark',
  },
});

const Main = styled('div', {
  base: {
    padding: '24px',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
});

const Footer = styled('div', {
  base: {
    padding: '24px',
    flexGrow: 0,
    flexShrink: 0,
  },
});
