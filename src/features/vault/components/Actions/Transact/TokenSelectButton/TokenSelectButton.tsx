import { css, type CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../../../components/AssetsImage/AssetsImage.tsx';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';
import {
  TokenImage,
  TokensImageWithChain,
} from '../../../../../../components/TokenImage/TokenImage.tsx';
import { VaultIcon } from '../../../../../../components/VaultIdentity/components/VaultIcon/VaultIcon.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import ExpandMore from '../../../../../../images/icons/mui/ExpandMore.svg?react';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { TransactMode, TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactDepositFromVaultId,
  selectTransactForceSelection,
  selectTransactIsDepositFromVault,
  selectTransactNumTokens,
  selectTransactOptionsMode,
  selectTransactSelected,
  selectTransactVaultHasCrossChainZap,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { styles } from './styles.ts';
import { useTransactSelectFlowCta } from '../hooks/useTransactSelectFlowCta.ts';

const useStyles = legacyMakeStyles(styles);

export type TokenSelectButtonProps = {
  index: number;
  css?: CssStyles;
};

export const TokenSelectButton = memo(function TokenSelectButton({
  index,
  css: cssProp,
}: TokenSelectButtonProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const selection = useAppSelector(selectTransactSelected);
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const numTokenOptions = useAppSelector(selectTransactNumTokens);
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const mode = useAppSelector(selectTransactOptionsMode);
  const hasCrossChainZap = useAppSelector(selectTransactVaultHasCrossChainZap);
  const canSwitchToTokenSelect = index === 0 && numTokenOptions > 1;
  const { openSelectStep } = useTransactSelectFlowCta();
  const isFromVaultMode = useAppSelector(selectTransactIsDepositFromVault);
  const isDepositFromVault = isFromVaultMode && index === 0;

  const tokenSymbol = useMemo(() => {
    return (
        vault.assetIds.length > 1 && vault.depositTokenAddress === selection.tokens[index].address
      ) ?
        'LP'
      : selection.tokens[index].symbol;
  }, [selection.tokens, vault.assetIds.length, vault.depositTokenAddress, index]);

  const isBreakLp = useMemo(() => {
    return mode === TransactMode.Withdraw && selection.tokens.length > 1;
  }, [mode, selection.tokens.length]);

  const isMultiDeposit = useMemo(() => {
    return mode === TransactMode.Deposit && selection.tokens.length > 1;
  }, [mode, selection.tokens.length]);

  if (isDepositFromVault) {
    return <VaultSelectButton cssProp={cssProp} />;
  }

  return (
    <button
      type="button"
      onClick={canSwitchToTokenSelect ? openSelectStep : undefined}
      className={css(
        styles.button,
        cssProp,
        canSwitchToTokenSelect && styles.buttonMore,
        forceSelection && styles.buttonForceSelection
      )}
    >
      {forceSelection && hasCrossChainZap ?
        <div className={css(styles.select, styles.forceSelection)}>{t('Transact-SelectChain')}</div>
      : forceSelection ?
        <div className={css(styles.select, styles.forceSelection)}>{t('Transact-SelectToken')}</div>
      : isBreakLp ?
        <BreakLp tokens={selection.tokens} />
      : <div className={classes.select}>
          <TokensImageWithChain
            chainId={selection.tokens[index].chainId}
            tokens={isMultiDeposit ? [selection.tokens[index]] : selection.tokens}
            css={styles.iconAssets}
            size={24}
          />
          {tokenSymbol}
        </div>
      }
      {canSwitchToTokenSelect ?
        <ExpandMore className={classes.iconMore} />
      : null}
    </button>
  );
});

type VaultSelectButtonProps = {
  cssProp: CssStyles | undefined;
};
const VaultSelectButton = memo(function VaultSelectButton({ cssProp }: VaultSelectButtonProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const fromVaultId = useAppSelector(selectTransactDepositFromVaultId);
  const fromVault = useAppSelector(state =>
    fromVaultId ? selectVaultById(state, fromVaultId) : undefined
  );

  const handleClick = useCallback(() => {
    dispatch(transactSwitchStep(TransactStep.DepositFromVaultSelect));
  }, [dispatch]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={css(
        styles.button,
        cssProp,
        styles.buttonMore,
        !fromVault && styles.buttonForceSelection
      )}
    >
      {fromVault ?
        <div className={classes.select}>
          <VaultIconWrapper>
            <VaultIcon vaultId={fromVault.id} size={24} />
            <VaultChainBadge>
              <ChainIcon chainId={fromVault.chainId} size={10} />
            </VaultChainBadge>
          </VaultIconWrapper>
          {fromVault.names.single}
        </div>
      : <div className={css(styles.select, styles.forceSelection)}>
          {t('Transact-DepositFromVault-Select')}
        </div>
      }
      <ExpandMore className={classes.iconMore} />
    </button>
  );
});

const VaultIconWrapper = styled('div', {
  base: {
    position: 'relative',
    display: 'inline-block',
    flexShrink: 0,
    lineHeight: 0,
  },
});

const VaultChainBadge = styled('div', {
  base: {
    position: 'absolute',
    right: '-2px',
    bottom: '-2px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    overflow: 'hidden',
    lineHeight: 0,
  },
});

const BreakLp = memo(function BreakLp({ tokens }: { tokens: TokenEntity[] }) {
  const classes = useStyles();
  if (tokens.length === 2) {
    const [token0, token1] = tokens;
    return (
      <div className={classes.breakLp}>
        <TokenImage address={token0.address} chainId={token0.chainId} size={16} />
        +
        <TokenImage address={token1.address} chainId={token1.chainId} size={16} />
      </div>
    );
  }

  return (
    <div className={classes.breakLp}>
      <AssetsImage assetSymbols={tokens.map(t => t.symbol)} chainId={tokens[0].chainId} size={16} />
    </div>
  );
});
