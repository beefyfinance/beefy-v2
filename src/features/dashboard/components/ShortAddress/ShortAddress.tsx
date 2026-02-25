import { memo, useCallback, useMemo } from 'react';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { formatAddressShort, formatDomain } from '../../../../helpers/format.ts';
import { useTranslation } from 'react-i18next';
import { styles } from './styles.ts';
import { useBreakpoint } from '../../../../hooks/useBreakpoint.ts';
import { DivWithTooltip } from '../../../../components/Tooltip/DivWithTooltip.tsx';
import { useCopyToClipboard } from '../../../../hooks/useCopyToClipboard.ts';

const useStyles = legacyMakeStyles(styles);

export type ShortAddressProps = {
  address: string;
  addressLabel?: string;
};

export const ShortAddress = memo(function ShortAddress({
  address,
  addressLabel,
}: ShortAddressProps) {
  const classes = useStyles();
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

  if (address) {
    return (
      <DivWithTooltip
        onClick={handleCopyAddressToClipboard}
        className={classes.triggerClass}
        children={<div className={classes.shortAddress}>{`(${shortAddressLabel})`}</div>}
        tooltip={status === 'success' ? t('Clipboard-Copied') : address}
      />
    );
  }

  return null;
});
