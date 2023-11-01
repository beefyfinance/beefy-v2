import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { formatAddressShort, formatDomain } from '../../../../helpers/format';
import { Tooltip } from '../../../../components/Tooltip';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type ShortAddressProps = {
  address: string;
  addressLabel?: string;
};

export const ShortAddress = memo<ShortAddressProps>(function ShortAddress({
  address,
  addressLabel,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'), { noSsr: true });

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
      <Tooltip
        onTriggerClick={handleCopyAddressToClipboard}
        contentClass={classes.longAddress}
        triggerClass={classes.triggerClass}
        tooltipClass={classes.tooltipContent}
        children={<div className={classes.shortAddress}>{`(${shortAddressLabel})`}</div>}
        content={showCopied ? t('Clipboard-Copied') : address}
      />
    );
  }

  return null;
});
