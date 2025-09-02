import { memo, type RefObject, useCallback, useState } from 'react';
import { BifiPricesContent, BifiPricesDropdown } from './BifiPricesDropdown.tsx';
import { PricesButtonDesktop, PricesButtonMobile } from './PricesButton.tsx';
import { DropdownProvider } from '../../../Dropdown/DropdownProvider.tsx';
import { styled } from '@repo/styles/jsx';
import { ScrollableDrawer, Layout, Main } from '../../../ScrollableDrawer/ScrollableDrawer.tsx';
import { Button } from '../../../Button/Button.tsx';
import { NavLink as RouterNavLink } from 'react-router';
import { useTranslation } from 'react-i18next';

export const BifiPricesDesktop = memo(function BifiPricesDesktop({
  positionRef,
}: {
  positionRef: RefObject<HTMLDivElement>;
}) {
  const [open, setOpen] = useState(false);
  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  return (
    <DropdownProvider
      open={open}
      onChange={setOpen}
      placement="bottom-end"
      variant="dark"
      positionReference={positionRef}
      layer={1}
      openOnHover={true}
      openOnClick={false}
    >
      <Container open={open}>
        <PricesButtonDesktop isOpen={open} />
        <BridgeNavButton to="bridge">Bridge</BridgeNavButton>
      </Container>
      {open && <BifiPricesDropdown onClose={handleClose} />}
    </DropdownProvider>
  );
});

export const BifiPricesMobile = memo(function BifiPricesMobile() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  return (
    <BifiPricesMobileContainer>
      <PricesButtonMobile isOpen={open} setOpen={setOpen} />
      <ScrollableDrawer
        open={open}
        onClose={handleClose}
        MainComponent={CustomMain}
        mainChildren={
          <ContentContainer>
            <BifiPricesContent />
          </ContentContainer>
        }
        footerChildren={
          <FooterButton fullWidth={true} borderless={true} onClick={handleClose}>
            {t('Filter-Cancel')}
          </FooterButton>
        }
        LayoutComponent={CustomLayout}
        hideShadow={true}
        mobileSpacingSize={0}
      />
    </BifiPricesMobileContainer>
  );
});

const CustomLayout = styled(Layout, {
  base: {
    height: 'auto',
    gap: '24px',
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
    padding: '10px 8px 10px 16px',
    textDecoration: 'none',
    outline: 'none',
    backgroundColor: 'background.button',
    borderRadius: '8px',
    _hover: {
      backgroundColor: 'darkBlue.40',
      color: 'text.light',
      cursor: 'pointer',
    },
    lg: {
      paddingBlock: '8px',
      paddingInline: '16px',
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
