import { Box, makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { isArray } from 'lodash';
import React from 'react';
import { AssetsImage } from '../../../../components/AssetsImage';
import { formatBigDecimals } from '../../../../helpers/format';
import { TokenEntity } from '../../../data/entities/token';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import {
  selectGovVaultUserStakedBalanceInDepositToken,
  selectStandardVaultUserBalanceInDepositTokenExcludingBoosts,
} from '../../../data/selectors/balance';
import {
  selectIsTokenLoaded,
  selectTokenByAddress,
  selectTokenById,
  selectTokenPriceByAddress,
  selectTokenPriceByTokenOracleId,
} from '../../../data/selectors/tokens';
import { selectVaultById } from '../../../data/selectors/vaults';
import { intersperse } from '../../../data/utils/array-utils';
import { styles } from './styles';
import { useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles);

export function TokenWithDeposit({
  vaultId,
  convertAmountTo,
  variant = 'lg',
}: {
  vaultId: VaultEntity['id'];
  convertAmountTo?: TokenEntity['id'] | TokenEntity['id'][];
  variant?: 'sm' | 'lg';
}) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );

  const oracleAmount = useAppSelector(state => {
    const mooTokenBalance = isGovVault(vault)
      ? selectGovVaultUserStakedBalanceInDepositToken(state, vault.id)
      : selectStandardVaultUserBalanceInDepositTokenExcludingBoosts(state, vault.id);
    return mooTokenBalance;
  });

  const amountsAndSymbol = useAppSelector((state): [BigNumber, string][] => {
    if (!convertAmountTo) {
      return [[oracleAmount, depositToken.symbol]];
    }
    let amountsAndSymbol: [BigNumber, string][] = [];
    const inputTokenPrice = selectTokenPriceByAddress(
      state,
      vault.chainId,
      vault.depositTokenAddress
    );

    const convertToArr = isArray(convertAmountTo) ? convertAmountTo : [convertAmountTo];
    for (const convertToId of convertToArr) {
      const outputTokenSymbol = selectIsTokenLoaded(state, vault.chainId, convertToId)
        ? selectTokenById(state, vault.chainId, convertToId).symbol
        : convertToId;
      const outputTokenPrice = selectTokenPriceByTokenOracleId(state, convertToId);
      const totalValue = oracleAmount.times(inputTokenPrice);
      const outputValue = totalValue.dividedBy(outputTokenPrice);
      amountsAndSymbol.push([outputValue.dividedBy(convertToArr.length), outputTokenSymbol]);
    }
    return amountsAndSymbol;
  });

  /**
   * MrTitoune: I just added an estimation of how much of each token you can withdraw that you have in the vault by mistake
   * MrTitoune: will remove it though, might be confusing
   * Pablo: I see
   * Pablo: Its actually can be useful feature, but need to change design slightly to make it less confusing for user
   *
   * So I left the most part of it and just hid the amount
   **/

  return (
    <Box className={classes.balanceContainer}>
      <Box>
        <AssetsImage
          chainId={vault.chainId}
          assetIds={
            convertAmountTo
              ? isArray(convertAmountTo)
                ? convertAmountTo
                : [convertAmountTo]
              : vault.assetIds
          }
          size={variant === 'sm' ? 20 : 24}
        />
      </Box>
      <Box flexGrow={1} pl={1}>
        <div className={classes.assetCount}>
          {intersperse(
            amountsAndSymbol.map(([amount, symbol]) => (
              <>
                <span style={{ display: convertAmountTo ? 'none' : undefined }}>
                  {/* This will be implemented later, we need to make the withdraw 
                  input mimick any of those display token, didn't want to delete this
                  to avoid you some work later */}
                  {formatBigDecimals(amount, 4)}{' '}
                </span>
                {symbol}
              </>
            )),
            () => <>{' + '}</>
          ).map((elem, i) => (
            <React.Fragment key={i}>{elem}</React.Fragment>
          ))}
        </div>
      </Box>
    </Box>
  );
}
