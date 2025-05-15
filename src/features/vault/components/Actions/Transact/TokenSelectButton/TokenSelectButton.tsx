import { css, type CssStyles } from '@repo/styles/css';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../../../components/AssetsImage/AssetsImage.tsx';
import { TokenImage, TokensImage } from '../../../../../../components/TokenImage/TokenImage.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import ExpandMore from '../../../../../../images/icons/mui/ExpandMore.svg?react';
import zapIcon from '../../../../../../images/icons/zap.svg';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { TransactMode, TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactForceSelection,
  selectTransactNumTokens,
  selectTransactOptionsMode,
  selectTransactSelected,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { styles } from './styles.ts';

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
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const selection = useAppSelector(selectTransactSelected);
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const numTokenOptions = useAppSelector(selectTransactNumTokens);
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const mode = useAppSelector(selectTransactOptionsMode);
  const canSwitchToTokenSelect = index === 0 && numTokenOptions > 1;

  const handleClick = useCallback(() => {
    dispatch(transactSwitchStep(TransactStep.TokenSelect));
  }, [dispatch]);

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

  return (
    <button
      type="button"
      onClick={canSwitchToTokenSelect ? handleClick : undefined}
      className={css(styles.button, cssProp, canSwitchToTokenSelect && styles.buttonMore)}
    >
      {forceSelection ?
        <div className={css(styles.select, styles.forceSelection)}>
          <div className={classes.zapIcon}>
            <img src={zapIcon} alt="zap" />
          </div>
          {t('Select')}
        </div>
      : isBreakLp ?
        <BreakLp tokens={selection.tokens} />
      : <div className={classes.select}>
          <TokensImage
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
