import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { formatAddressShort, formatDomain } from '../../../../helpers/format.ts';
import { useTranslation } from 'react-i18next';
import { styles } from './styles.ts';
import { useBreakpoint } from '../../../../components/MediaQueries/useBreakpoint.ts';
import { DivWithTooltip } from '../../../../components/Tooltip/DivWithTooltip.tsx';

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
  const [showCopied, setShowCopied] = useState<boolean>(false);
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
      <DivWithTooltip
        onClick={handleCopyAddressToClipboard}
        className={classes.triggerClass}
        children={<div className={classes.shortAddress}>{`(${shortAddressLabel})`}</div>}
        tooltip={showCopied ? t('Clipboard-Copied') : address}
      />
    );
  }

  return null;
});
