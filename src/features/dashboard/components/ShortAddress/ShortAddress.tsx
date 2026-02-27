import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import { formatAddressShort, formatDomain } from '../../../../helpers/format.ts';
import { useBreakpoint } from '../../../../hooks/useBreakpoint.ts';
import { useCopyToClipboard } from '../../../../hooks/useCopyToClipboard.ts';

export type ShortAddressProps = {
  address: string;
  addressLabel?: string;
};

export const ShortAddress = memo(function ShortAddress({
  address,
  addressLabel,
}: ShortAddressProps) {
  const { t } = useTranslation();
  const [isHover, setIsHover] = useState<boolean>(false);
  const { copy, status } = useCopyToClipboard();
  const mdUp = useBreakpoint({ from: 'sm' });

  const handleCopyAddressToClipboard = useCallback(() => {
    copy(address);
  }, [address, copy]);

  const shortAddressLabel = useMemo(() => {
    if (addressLabel) {
      return mdUp ? formatDomain(addressLabel, 20) : formatDomain(addressLabel);
    }

    return formatAddressShort(address);
  }, [addressLabel, address, mdUp]);

  if (address) {
    return (
      <ShortAddressContainer onClick={handleCopyAddressToClipboard}>
        <Text
          variant="dark"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          {shortAddressLabel}
        </Text>

        {isHover ?
          <Text variant="light">
            {status === 'success' ? t('Clipboard-Copied') : t('Clipboard-CopyToClipboard')}
          </Text>
        : null}
      </ShortAddressContainer>
    );
  }

  return null;
});

const ShortAddressContainer = styled('div', {
  base: {
    display: 'flex',
    gap: '9px',
    minWidth: 0,
    overflow: 'hidden',
    flexShrink: 1,
    _hover: {
      cursor: 'pointer',
    },
  },
});

const Text = styled('div', {
  base: {
    textStyle: 'label',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  variants: {
    variant: {
      light: {
        color: 'text.light',
      },
      dark: {
        color: 'text.dark',
      },
    },
  },
});
