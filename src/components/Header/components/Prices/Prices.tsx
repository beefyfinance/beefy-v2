import { makeStyles } from '@material-ui/core';
import { memo, type MouseEvent, type ReactNode, useCallback, useEffect, useState } from 'react';
import { formatBigUsd } from '../../../../helpers/format';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  selectTokenByAddress,
  selectTokenPriceByTokenOracleId,
} from '../../../../features/data/selectors/tokens';
import { styles } from './styles';
import bifiIcon from '../../../../images/single-assets/BIFI.png';
import mooIcon from '../../../../images/single-assets/mooBIFI.png';
import opIcon from '../../../../images/networks/optimism.svg';
import ethIcon from '../../../../images/networks/ethereum.svg';
import oneInchIcon from '../../../../images/icons/one-inch.svg';
import llamaSwapIcon from '../../../../images/icons/llama-swap.png';
import { Tooltip, TRIGGERS } from '../../../Tooltip';
import clsx from 'clsx';
import {
  selectVaultById,
  selectVaultExistsById,
  selectVaultPricePerFullShare,
} from '../../../../features/data/selectors/vaults';
import type { ChainEntity } from '../../../../features/data/entities/chain';
import { addTokenToWalletAction } from '../../../../features/data/actions/add-to-wallet';
import { AccountBalanceWallet } from '@material-ui/icons';

const useStyles = makeStyles(styles);

type Token = {
  symbol: string;
  address: string;
  oracleId: string;
  chainId: ChainEntity['id'];
  icon: string;
  explorer: {
    name: string;
    icon: string;
    url: string;
  };
  walletIconUrl?: string;
  oneInchUrl: string;
  llamaSwapUrl: string;
};

const tokens: Token[] = [
  {
    symbol: 'BIFI',
    address: '0xB1F1ee126e9c96231Cc3d3fAD7C08b4cf873b1f1',
    oracleId: 'BIFI',
    chainId: 'ethereum',
    icon: bifiIcon,
    explorer: {
      name: 'Etherscan',
      icon: ethIcon,
      url: 'https://etherscan.io/token/0xB1F1ee126e9c96231Cc3d3fAD7C08b4cf873b1f1',
    },
    walletIconUrl: 'https://beefy.com/icons/128/BIFI.png',
    oneInchUrl: 'https://app.1inch.io/#/1/simple/swap/ETH/BIFI',
    llamaSwapUrl:
      'https://swap.defillama.com/?chain=ethereum&from=0x0000000000000000000000000000000000000000&to=0xb1f1ee126e9c96231cc3d3fad7c08b4cf873b1f1',
  },
  {
    symbol: 'mooBIFI',
    address: '0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
    oracleId: 'mooBIFI',
    chainId: 'optimism',
    icon: mooIcon,
    explorer: {
      name: 'Etherscan',
      icon: opIcon,
      url: 'https://optimistic.etherscan.io/token/0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
    },
    walletIconUrl: 'https://beefy.com/icons/128/mooBIFI.png',
    oneInchUrl: 'https://app.1inch.io/#/10/simple/swap/ETH/mooBIFI',
    llamaSwapUrl:
      'https://swap.defillama.com/?chain=optimism&from=0x0000000000000000000000000000000000000000&to=0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
  },
];

type AddToWalletProps = {
  title: string;
  tokenAddress: string;
  customIconUrl: string;
  chainId: ChainEntity['id'];
  children: ReactNode;
};

const AddToWallet = memo<AddToWalletProps>(function AddToWallet({
  tokenAddress,
  customIconUrl,
  title,
  chainId,
  children,
}) {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const handleAddToken = useCallback(() => {
    dispatch(
      addTokenToWalletAction({
        tokenAddress,
        chainId,
        customIconUrl,
      })
    );
  }, [dispatch, tokenAddress, chainId, customIconUrl]);

  return (
    <button title={title} onClick={handleAddToken} className={classes.iconLink}>
      {children}
    </button>
  );
});

type NavTokenProps = {
  className?: string;
  token: Token;
};

const NavToken = memo<NavTokenProps>(function NavToken({ token, className }) {
  const { symbol, oracleId, icon } = token;
  const classes = useStyles();
  const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, oracleId));

  return (
    <div className={clsx(classes.navToken, className)}>
      <img alt={symbol} src={icon} height={24} className={classes.navIcon} />
      {formatBigUsd(price)}
    </div>
  );
});

type TooltipTokenProps = {
  className?: string;
  token: Token;
};

const TooltipToken = memo<TooltipTokenProps>(function TooltipToken({ token }) {
  const {
    symbol,
    oracleId,
    icon,
    explorer,
    llamaSwapUrl,
    oneInchUrl,
    address,
    walletIconUrl,
    chainId,
  } = token;
  const classes = useStyles();
  const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, oracleId));

  return (
    <>
      <img alt={symbol} src={icon} height={24} className={classes.icon} />
      <div className={classes.symbol}>{symbol}</div>
      <div className={classes.price}>{formatBigUsd(price)}</div>
      <a
        href={explorer.url}
        target="_blank"
        rel="noopener"
        title={`View at ${explorer.name}`}
        className={classes.iconLink}
      >
        <img alt={explorer.name} src={explorer.icon} height={24} className={classes.icon} />
      </a>
      <a
        href={llamaSwapUrl}
        target="_blank"
        rel="noopener"
        title={`Buy via LlamaSwap`}
        className={classes.iconLink}
      >
        <img alt={'LlamaSwap'} src={llamaSwapIcon} height={24} className={classes.icon} />
      </a>
      <a
        href={oneInchUrl}
        target="_blank"
        rel="noopener"
        title={`Buy via 1inch`}
        className={classes.iconLink}
      >
        <img alt={'1inch'} src={oneInchIcon} height={24} className={classes.icon} />
      </a>
      <AddToWallet
        title={`Add to Wallet`}
        chainId={chainId}
        tokenAddress={address}
        customIconUrl={walletIconUrl}
      >
        <AccountBalanceWallet className={classes.icon} />
      </AddToWallet>
    </>
  );
});

const TooltipTokens = memo(function TooltipTokens() {
  const classes = useStyles();
  return (
    <div className={classes.tooltipTokens}>
      {tokens.map((token, i) => (
        <TooltipToken key={i} token={token} />
      ))}
    </div>
  );
});

const TooltipPricePerFullShare = memo(function TooltipPricePerFullShare() {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, 'bifi-vault'));
  const ppfs = useAppSelector(state => selectVaultPricePerFullShare(state, 'bifi-vault'));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const earnedToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );

  return (
    <div className={classes.mooToken}>
      1 {earnedToken.symbol} {'→'} {ppfs.toString(10)} {depositToken.symbol}
    </div>
  );
});

const TooltipContent = memo(function TooltipContent() {
  const vaultLoaded = useAppSelector(state => selectVaultExistsById(state, 'bifi-vault'));
  return (
    <>
      <TooltipTokens />
      {vaultLoaded ? <TooltipPricePerFullShare /> : null}
    </>
  );
});

export const Prices = memo(function Prices() {
  const classes = useStyles();
  const [current, setCurrent] = useState(0);
  const next = current < tokens.length - 1 ? current + 1 : 0;
  const shouldPropagate = useCallback<(e: MouseEvent<HTMLDivElement>) => boolean>(e => {
    // this is a hack to make the tooltip close when a button/link is clicked
    return ['a', 'button', 'path', 'svg', 'img'].includes(e.target?.['tagName']?.toLowerCase());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(i => (i < tokens.length - 1 ? i + 1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={classes.holder}>
      <Tooltip
        content={<TooltipContent />}
        triggers={TRIGGERS.CLICK}
        triggerClass={classes.trigger}
        contentClass={classes.tooltipContent}
        arrowClass={classes.tooltipArrow}
        propagateTooltipClick={shouldPropagate}
      >
        {tokens.map((token, i) => (
          <NavToken
            key={i}
            token={token}
            className={clsx({
              [classes.face]: true,
              [classes.current]: i === current,
              [classes.next]: i === next,
              [classes.hidden]: i !== current && i !== next,
            })}
          />
        ))}
      </Tooltip>
    </div>
  );
});
