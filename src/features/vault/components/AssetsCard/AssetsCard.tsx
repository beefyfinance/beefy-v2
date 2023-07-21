import { ClickAwayListener, Popper, makeStyles } from '@material-ui/core';
import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsable } from '../../../../components/Collapsable';
import { useAppSelector } from '../../../../store';
import type { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { styles } from './styles';
import { TokenCard } from '../TokenCard';
import type { BridgeEntity } from '../../../data/entities/bridge';
import { BridgeTooltipContent, NativeTooltipContent } from '../BridgeTag';
import { selectChainById } from '../../../data/selectors/chains';

const useStyles = makeStyles(styles);

interface AssetsCardProps {
  vaultId: VaultEntity['id'];
}

export const AssetsCard = memo<AssetsCardProps>(function AssetsCard({ vaultId }) {
  const { t } = useTranslation();

  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Collapsable openByDefault={true} titleClassName={classes.title} title={t('Asset-Detail')}>
        <TokenCards vaultId={vaultId} />
      </Collapsable>
    </div>
  );
});

interface TooltipTokenInfo {
  native: boolean;
  bridge: BridgeEntity | null;
}

export type HandleTokenTooltipInfoClick = (
  newTooltipInfo: TooltipTokenInfo
) => (event: React.MouseEvent<HTMLDivElement>) => void;

export const TokenCards = memo<AssetsCardProps>(function TokenCards({ vaultId }) {
  const [tooltipContent, setTooltipContent] = useState<TooltipTokenInfo>({
    native: false,
    bridge: null,
  });
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const [open, setOpen] = React.useState(false);

  const handleClick =
    (newTooltipInfo: TooltipTokenInfo) => (event: React.MouseEvent<HTMLDivElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen(true);
      setTooltipContent(newTooltipInfo);
      console.log(event);
    };

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div className={classes.cards}>
        {vault.assetIds.map(tokenId => (
          <TokenCard
            handleClick={handleClick}
            key={tokenId}
            chainId={vault.chainId}
            tokenId={tokenId}
          />
        ))}
        <Popper placement="top" anchorEl={anchorEl} open={open}>
          <div className={classes.content}>
            {tooltipContent.native ? (
              <NativeTooltipContent chain={chain} />
            ) : tooltipContent.bridge ? (
              <BridgeTooltipContent bridge={tooltipContent.bridge} chain={chain} />
            ) : null}
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  );
});
