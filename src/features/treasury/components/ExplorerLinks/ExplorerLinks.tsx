import { ClickAwayListener, makeStyles } from '@material-ui/core';

import type { MouseEventHandler } from 'react';
import React, { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Floating } from '../../../../components/Floating';
import { useAppSelector } from '../../../../store';
import type { ChainEntity } from '../../../data/entities/chain';
import { selectTreasuryWalletAddressesByChainId } from '../../../data/selectors/treasury';
import { styles } from './styles';
import iconExternalLink from '../../../../images/icons/external-link.svg';

const useStyles = makeStyles(styles);

interface ExplorerLinkProps {
  chainId: ChainEntity['id'];
}
export const ExplorerLinks = memo<ExplorerLinkProps>(function ExplorerLinks({ chainId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const anchorEl = useRef<HTMLDivElement | null>(null);
  const wallets = useAppSelector(state => selectTreasuryWalletAddressesByChainId(state, chainId));

  const handleToggle = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      e.stopPropagation();
      setIsOpen(open => !open);
    },
    [setIsOpen]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);
  return (
    <ClickAwayListener onClickAway={handleClose} mouseEvent="onMouseDown" touchEvent="onTouchStart">
      <div className={classes.center} onClick={handleToggle} ref={anchorEl}>
        <img className={classes.icon} src={iconExternalLink} alt="external link" />
        <Floating
          open={isOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          className={classes.dropdown}
          display="flex"
          autoWidth={false}
        >
          {wallets.map(wallet => {
            return (
              <a
                key={wallet.address}
                href={wallet.url}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.item}
              >
                {t(`Treasury-${wallet.name}`)}
                <img src={iconExternalLink} alt="external link" />
              </a>
            );
          })}
        </Floating>
      </div>
    </ClickAwayListener>
  );
});
