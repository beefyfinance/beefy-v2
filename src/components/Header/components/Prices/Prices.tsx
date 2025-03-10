import { memo, useState } from 'react';
import { PricesDropdown } from './PricesDropdown.tsx';
import { PricesButton } from './PricesButton.tsx';
import { DropdownProvider } from '../../../Dropdown/DropdownProvider.tsx';

export const Prices = memo(function Prices() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownProvider
      open={open}
      onChange={setOpen}
      placement="bottom-end"
      variant="dark"
      arrowEnabled={true}
      layer={1}
    >
      <PricesButton />
      {open && <PricesDropdown setOpen={setOpen} />}
    </DropdownProvider>
  );
});
