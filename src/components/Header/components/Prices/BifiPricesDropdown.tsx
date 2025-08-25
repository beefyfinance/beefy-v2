import { memo, type MouseEvent, useCallback } from 'react';
import { selectVaultExistsById } from '../../../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { DropdownContent } from '../../../Dropdown/DropdownContent.tsx';
import { PricePerFullShare } from './PricePerFullShare.tsx';
import { Tokens } from './Tokens.tsx';
import { styled } from '@repo/styles/jsx';

type BifiPricesDropdownProps = {
  onClose: () => void;
};

export const BifiPricesDropdown = memo(function BifiPricesDropdown({
  onClose,
}: BifiPricesDropdownProps) {
  const handleClose = useCallback<(e: MouseEvent<HTMLDivElement>) => void>(
    e => {
      if (!e.target || !(e.target instanceof HTMLElement)) {
        return;
      }

      // this is a hack to make the dropdown close when a button/link is clicked
      if (['a', 'button', 'path', 'svg', 'img'].includes(e.target.tagName.toLowerCase())) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dropdown padding="none" onClick={handleClose}>
      <BifiPricesContent />
    </Dropdown>
  );
});

export const BifiPricesContent = memo(function BifiPricesContent() {
  const vaultLoaded = useAppSelector(state => selectVaultExistsById(state, 'bifi-vault'));
  return (
    <>
      <PricesContainer>
        <Tokens />
      </PricesContainer>
      <Footer>
        {vaultLoaded ?
          <PricePerFullShare />
        : null}
      </Footer>
    </>
  );
});

const Footer = styled('div', {
  base: {
    padding: '4px 12px',
  },
});

const PricesContainer = styled('div', {
  base: {
    backgroundColor: 'background.content.light',
    borderRadius: '8px',
    padding: '4px 12px',
  },
});

const Dropdown = styled(DropdownContent, {
  base: {
    backgroundColor: 'background.content',
    gap: '0px',
    borderRadius: '8px',
    minWidth: '400px',
  },
});
