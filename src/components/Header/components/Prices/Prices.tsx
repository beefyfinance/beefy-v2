import { makeStyles } from '@material-ui/core';
import {
  type CSSProperties,
  memo,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { formatLargeUsd } from '../../../../helpers/format';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  selectTokenByAddress,
  selectTokenPriceByTokenOracleId,
} from '../../../../features/data/selectors/tokens';
import { styles } from './styles';
import bifiIcon from '../../../../images/single-assets/BIFI.png';
import mooIcon from '../../../../images/single-assets/mooBIFI.png';
import opIcon from '../../../../images/networks/optimism.svg';
import baseIcon from '../../../../images/networks/base.svg';
import sonicIcon from '../../../../images/networks/sonic.svg';
import ethIcon from '../../../../images/networks/ethereum.svg';
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
import type { PlatformEntity } from '../../../../features/data/entities/platform';
import { getPlatformSrc } from '../../../../helpers/platformsSrc';
import { selectPlatformByIdOrUndefined } from '../../../../features/data/selectors/platforms';

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
  walletIconUrl: string;
  buyPlatformUrl?: string;
  buyPlatformId?: PlatformEntity['id'];
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
    buyPlatformUrl:
      'https://swap.defillama.com/?chain=ethereum&from=0x0000000000000000000000000000000000000000&to=0xb1f1ee126e9c96231cc3d3fad7c08b4cf873b1f1',
  },
  {
    symbol: 'mooBIFI',
    address: '0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
    oracleId: 'opmooBIFI',
    chainId: 'optimism',
    icon: mooIcon,
    explorer: {
      name: 'Etherscan',
      icon: opIcon,
      url: 'https://optimistic.etherscan.io/token/0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
    },
    walletIconUrl: 'https://beefy.com/icons/128/mooBIFI.png',
    buyPlatformUrl:
      'https://swap.defillama.com/?chain=optimism&from=0x0000000000000000000000000000000000000000&to=0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
  },
  {
    symbol: 'mooBIFI',
    address: '0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
    oracleId: 'basemooBIFI',
    chainId: 'base',
    icon: mooIcon,
    explorer: {
      name: 'Etherscan',
      icon: baseIcon,
      url: 'https://basescan.org/token/0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
    },
    walletIconUrl: 'https://beefy.com/icons/128/mooBIFI.png',
    buyPlatformUrl:
      'https://swap.defillama.com/?chain=base&from=0x0000000000000000000000000000000000000000&to=0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
  },
  {
    symbol: 'mooBIFI',
    address: '0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
    oracleId: 'smooBIFI',
    chainId: 'sonic',
    icon: mooIcon,
    explorer: {
      name: 'Etherscan',
      icon: sonicIcon,
      url: 'https://sonicscan.org/token/0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
    },
    walletIconUrl: 'https://beefy.com/icons/128/mooBIFI.png',
    buyPlatformUrl:
      'https://www.shadow.so/trade?inputCurrency=0x29219dd400f2Bf60E5a23d13Be72B486D4038894&outputCurrency=0xc55E93C62874D8100dBd2DfE307EDc1036ad5434',
    buyPlatformId: 'shadow',
  },
];

type AddToWalletProps = {
  title: string;
  tokenAddress: string;
  customIconUrl: string;
  chainId: ChainEntity['id'];
  children: ReactNode;
  style?: CSSProperties;
};

const AddToWallet = memo<AddToWalletProps>(function AddToWallet({
  tokenAddress,
  customIconUrl,
  title,
  chainId,
  children,
  style,
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
    <button title={title} onClick={handleAddToken} className={classes.iconLink} style={style}>
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
      {formatLargeUsd(price, { decimalsUnder: 2 })}
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
    buyPlatformUrl,
    address,
    walletIconUrl,
    chainId,
    buyPlatformId = '',
  } = token;
  const classes = useStyles();
  const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, oracleId));
  const platform = useAppSelector(state => selectPlatformByIdOrUndefined(state, buyPlatformId));

  return (
    <>
      <img alt={symbol} src={icon} height={24} className={classes.icon} />
      <div className={classes.symbol}>{symbol}</div>
      <div className={classes.price}>{formatLargeUsd(price, { decimalsUnder: 2 })}</div>
      <a
        href={explorer.url}
        target="_blank"
        rel="noopener"
        title={`View at ${explorer.name}`}
        className={classes.iconLink}
      >
        <img alt={explorer.name} src={explorer.icon} height={24} className={classes.icon} />
      </a>
      {buyPlatformUrl ? (
        <a
          href={buyPlatformUrl}
          target="_blank"
          rel="noopener"
          title={`Buy via ${platform ? platform.name : 'LlamaSwap'}`}
          className={classes.iconLink}
        >
          <img
            alt={platform ? platform.name : 'LlamaSwap'}
            src={platform ? getPlatformSrc(platform.id) : llamaSwapIcon}
            height={24}
            className={classes.icon}
          />
        </a>
      ) : null}
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
    selectTokenByAddress(state, vault.chainId, vault.contractAddress)
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
        propagateTooltipClick={shouldPropagate}
        dark={true}
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
