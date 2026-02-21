import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { formatAddressShort, formatDomain } from '../../../../helpers/format.ts';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../../../../components/MediaQueries/useBreakpoint.ts';
import { styled } from '@repo/styles/jsx';

export type ShortAddressProps = {
  address: string;
  addressLabel?: string;
};

export const ShortAddress = memo(function ShortAddress({
  address,
  addressLabel,
}: ShortAddressProps) {
  const { t } = useTranslation();
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const [isHover, setIsHover] = useState<boolean>(false);
  const mdUp = useBreakpoint({ from: 'sm' });

  const handleCopyAddressToClipboard = useCallback(() => {
    navigator.clipboard
      .writeText(address)
      .then(() => setShowCopied(true))
      .catch(e => console.error(e));
  }, [address, setShowCopied]);

  const shortAddressLabel = useMemo(() => {
    if (addressLabel) {
      return mdUp ? formatDomain(addressLabel, 20) : formatDomain(addressLabel);
    }

    return formatAddressShort(address);
  }, [addressLabel, address, mdUp]);

  useEffect(() => {
    if (showCopied) {
      const handle = setTimeout(() => {
        setShowCopied(false);
      }, 3000);
      return () => clearTimeout(handle);
    }
  }, [showCopied, setShowCopied]);

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
            {showCopied ? t('Clipboard-Copied') : t('Clipboard-CopyToClipboard')}
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
    _hover: {
      cursor: 'pointer',
    },
  },
});

const Text = styled('div', {
  base: {
    textStyle: 'label',
    fontWeight: 500,
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
