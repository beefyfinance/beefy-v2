import { memo, useState } from 'react';
import { BifiPricesContent, BifiPricesDropdown } from './BifiPricesDropdown.tsx';
import { PricesButtonDesktop, PricesButtonMobile } from './PricesButton.tsx';
import { DropdownProvider } from '../../../Dropdown/DropdownProvider.tsx';
import { styled } from '@repo/styles/jsx';
import { ScrollableDrawer, Layout, Main } from '../../../ScrollableDrawer/ScrollableDrawer.tsx';
import { Button } from '../../../Button/Button.tsx';
import { NavLink as RouterNavLink } from 'react-router';
import { useTranslation } from 'react-i18next';

export const BifiPricesDesktop = memo(function BifiPricesDesktop({
  anchorEl,
}: {
  anchorEl: React.RefObject<HTMLDivElement>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownProvider
      open={open}
      onChange={setOpen}
      placement="bottom-end"
      variant="dark"
      reference={anchorEl}
      layer={1}
      openOnHover={true}
      openOnClick={false}
    >
      <Container open={open}>
        <PricesButtonDesktop isOpen={open} />
        <BridgeNavButton to="bridge">Bridge</BridgeNavButton>
      </Container>
      {open && <BifiPricesDropdown setOpen={setOpen} />}
    </DropdownProvider>
  );
});

export const BifiPricesMobile = memo(function BifiPricesMobile() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <BifiPricesMobileContainer>
      <PricesButtonMobile setOpen={setOpen} />
      <ScrollableDrawer
        open={open}
        onClose={() => setOpen(false)}
        MainComponent={CustomMain}
        mainChildren={
          <ContentContainer>
            <BifiPricesContent />
          </ContentContainer>
        }
        footerChildren={
          <FooterButton fullWidth={true} borderless={true} onClick={() => setOpen(false)}>
            {t('Filter-Cancel')}
          </FooterButton>
        }
        LayoutComponent={CustomLayout}
        hideShadow={true}
        mobileSpacingSize={12}
      />
    </BifiPricesMobileContainer>
  );
});

const CustomLayout = styled(Layout, {
  base: {
    height: '360px',
    borderTopRadius: '16px',
  },
});

const CustomMain = styled(Main, {
  base: {
    paddingInline: '12px',
    paddingBlock: '12px 0px',
  },
});

const BifiPricesMobileContainer = styled('div', {
  base: {
    position: 'relative',
  },
});

export const BridgeNavButton = styled(RouterNavLink, {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'text.middle',
    textStyle: 'body.medium',
    paddingBlock: '6px',
    paddingInline: '16px',
    textDecoration: 'none',
    outline: 'none',
    backgroundColor: 'background.button',
    borderRadius: '8px',
    _hover: {
      color: 'text.light',
      cursor: 'pointer',
    },
    lg: {
      paddingBlock: '8px',
    },
  },
});

const Container = styled('div', {
  base: {
    backgroundColor: 'background.content.dark',
    display: 'flex',
    borderRadius: '8px',
  },
  variants: {
    open: {
      true: {
        backgroundColor: 'background.content',
      },
    },
  },
});

const ContentContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'background.content',
    borderRadius: '8px',
  },
});

const FooterButton = styled(Button, {
  base: {
    backgroundColor: 'darkBlue.80',
    color: 'text.dark',
  },
});
