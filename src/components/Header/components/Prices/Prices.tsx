import { memo, useState } from 'react';
import { PricesDropdown } from './PricesDropdown.tsx';
import { PricesButton } from './PricesButton.tsx';
import { DropdownProvider } from '../../../Dropdown/DropdownProvider.tsx';
import { styled } from '@repo/styles/jsx';
import { NavLink } from 'react-router';

export const Prices = memo(function Prices() {
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
        <PricesButton isOpen={open} />
        <BridgeButton to="/bridge">Bridge</BridgeButton>
      </Container>
      {open && <PricesDropdown setOpen={setOpen} />}
    </DropdownProvider>
  );
});

const BridgeButton = styled(NavLink, {
  base: {
    color: 'text.middle',
    textStyle: 'body.bold',
    paddingBlock: '8px',
    paddingInline: '16px',
    textDecoration: 'none',
    outline: 'none',
    backgroundColor: 'background.button',
    borderRadius: '8px',
    _hover: {
      color: 'text.light',
      cursor: 'pointer',
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
