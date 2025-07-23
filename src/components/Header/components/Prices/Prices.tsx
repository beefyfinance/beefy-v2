import { memo, useState } from 'react';
import { BifiPricesContent, BifiPricesDropdown } from './BifiPricesDropdown.tsx';
import { PricesButtonDesktop, PricesButtonMobile } from './PricesButton.tsx';
import { DropdownProvider } from '../../../Dropdown/DropdownProvider.tsx';
import { styled } from '@repo/styles/jsx';
import { ScrollableDrawer } from '../../../ScrollableDrawer/ScrollableDrawer.tsx';
import { Button } from '../../../Button/Button.tsx';
import { css } from '@repo/styles/css';
import { NavLink as RouterNavLink } from 'react-router';

export const BifiPricesDesktop = memo(function BifiPricesDesktop() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownProvider
      open={open}
      onChange={setOpen}
      placement="bottom-start"
      variant="dark"
      layer={1}
    >
      <Container>
        <PricesButtonDesktop isOpen={open} />
        <BridgeNavButton to="bridge">Bridge</BridgeNavButton>
      </Container>
      {open && <BifiPricesDropdown setOpen={setOpen} />}
    </DropdownProvider>
  );
});

export const BifiPricesMobile = memo(function BifiPricesMobile() {
  const [open, setOpen] = useState(false);

  return (
    <BifiPricesMobileContainer>
      <PricesButtonMobile setOpen={setOpen} />
      <ScrollableDrawer
        open={open}
        onClose={() => setOpen(false)}
        mainChildren={
          <ContentContainer>
            <BifiPricesContent />
          </ContentContainer>
        }
        footerChildren={
          <FooterButton fullWidth={true} borderless={true} onClick={() => setOpen(false)}>
            Close
          </FooterButton>
        }
        layoutClass={css.raw({ height: '360px', borderTopRadius: '12px', padding: '12px' })}
        hideShadow={true}
        mobileSpacingSize={12}
      />
    </BifiPricesMobileContainer>
  );
});

const BifiPricesMobileContainer = styled('div', {
  base: {
    position: 'relative',
  },
});

export const BridgeNavButton = styled(RouterNavLink, {
  base: {
    color: 'text.middle',
    textStyle: 'body.bold',
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
    backgroundColor: 'background.content',
    display: 'flex',
    borderRadius: '8px',
  },
});

const ContentContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'background.content',
    borderRadius: '12px',
  },
});

const FooterButton = styled(Button, {
  base: {
    backgroundColor: 'darkBlue.80',
    color: 'text.dark',
  },
});
