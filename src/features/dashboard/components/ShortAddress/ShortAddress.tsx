import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import { formatAddressShort, formatDomain } from '../../../../helpers/format.ts';
import { useBreakpoint } from '../../../../hooks/useBreakpoint.ts';
import { useCopyToClipboard } from '../../../../hooks/useCopyToClipboard.ts';
import CopyIcon from '../../../../images/icons/copy.svg?react';

export type ShortAddressProps = {
  address: string;
  addressLabel?: string;
};

export const ShortAddress = memo(function ShortAddress({
  address,
  addressLabel,
}: ShortAddressProps) {
  const { t } = useTranslation();
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

  if (!address) {
    return null;
  }

  const copied = status === 'success';

  return (
    <ShortAddressContainer onClick={handleCopyAddressToClipboard}>
      <Text>{copied ? t('Clipboard-Copied') : shortAddressLabel}</Text>
      {copied ? null : (
        <IconWrap>
          <CopyIcon />
        </IconWrap>
      )}
    </ShortAddressContainer>
  );
});

const ShortAddressContainer = styled('button', {
  base: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    minWidth: 0,
    overflow: 'hidden',
    flexShrink: 1,
    color: 'text.dark',
    cursor: 'pointer',
    _hover: {
      color: 'text.light',
    },
  },
});

const Text = styled('div', {
  base: {
    textStyle: 'label',
    fontWeight: 500,
    color: 'inherit',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

const IconWrap = styled('div', {
  base: {
    display: 'flex',
    flexShrink: 0,
    width: '16px',
    height: '16px',
    color: 'inherit',
  },
});
