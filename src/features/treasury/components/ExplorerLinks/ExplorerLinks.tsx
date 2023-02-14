import { ClickAwayListener, makeStyles } from '@material-ui/core';

import React, { memo, MouseEventHandler, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Floating } from '../../../../components/Floating';
import { useAppSelector } from '../../../../store';
import { ChainEntity } from '../../../data/entities/chain';
import { selectChainById } from '../../../data/selectors/chains';
import { selectTreasuryWalletAddressesByChainId } from '../../../data/selectors/treasury';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface ExplorerLinkProps {
  chainId: ChainEntity['id'];
}

export const ExplorerLinks = memo<ExplorerLinkProps>(function ({ chainId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const anchorEl = useRef<HTMLDivElement | null>(null);
  const chain = useAppSelector(state => selectChainById(state, chainId));
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
        <img
          className={classes.icon}
          src={require('../../../../images/icons/external-link.svg').default}
          alt="external link"
        />
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
                href={`${chain.explorerUrl}/address/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.item}
              >
                {t(`Treasury-${wallet.name}`)}
                <img
                  src={require('../../../../images/icons/external-link.svg').default}
                  alt="external link"
                />
              </a>
            );
          })}
        </Floating>
      </div>
    </ClickAwayListener>
  );
});
