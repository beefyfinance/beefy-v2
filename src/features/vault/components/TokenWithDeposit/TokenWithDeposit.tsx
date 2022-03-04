import { Box, makeStyles, Typography } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { isArray } from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { AssetsImage } from '../../../../components/AssetsImage';
import { formatBigDecimals } from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { TokenEntity } from '../../../data/entities/token';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import {
  selectGovVaultUserStackedBalanceInOracleToken,
  selectStandardVaultUserBalanceInOracleTokenExcludingBoosts,
} from '../../../data/selectors/balance';
import {
  selectIsTokenLoaded,
  selectTokenById,
  selectTokenPriceByTokenId,
} from '../../../data/selectors/tokens';
import { selectVaultById } from '../../../data/selectors/vaults';
import { intersperse } from '../../../data/utils/array-utils';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);

export function TokenWithDeposit({
  vaultId,
  convertAmountTo,
}: {
  vaultId: VaultEntity['id'];
  convertAmountTo?: TokenEntity['id'] | TokenEntity['id'][];
}) {
  const classes = useStyles();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));

  const oracleToken = useSelector((state: BeefyState) =>
    selectTokenById(state, vault.chainId, vault.oracleId)
  );

  const oracleAmount = useSelector((state: BeefyState) => {
    const mooTokenBalance = isGovVault(vault)
      ? selectGovVaultUserStackedBalanceInOracleToken(state, vault.id)
      : selectStandardVaultUserBalanceInOracleTokenExcludingBoosts(state, vault.id);
    return mooTokenBalance;
  });

  const amountsAndSymbol = useSelector((state: BeefyState): [BigNumber, string][] => {
    if (!convertAmountTo) {
      return [[oracleAmount, oracleToken.symbol]];
    }
    let amountsAndSymbol: [BigNumber, string][] = [];
    const inputTokenPrice = selectTokenPriceByTokenId(state, oracleToken.id);

    const convertToArr = isArray(convertAmountTo) ? convertAmountTo : [convertAmountTo];
    for (const convertToId of convertToArr) {
      const outputTokenSymbol = selectIsTokenLoaded(state, vault.chainId, convertToId)
        ? selectTokenById(state, vault.chainId, convertToId).symbol
        : convertToId;
      const outputTokenPrice = selectTokenPriceByTokenId(state, convertToId);
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
    <Box className={classes.balanceContainer} display="flex" alignItems="center">
      <Box lineHeight={0}>
        <AssetsImage
          img={oracleToken.id === vault.oracleId && !convertAmountTo ? vault.logoUri : null}
          assets={
            convertAmountTo
              ? isArray(convertAmountTo)
                ? convertAmountTo
                : [convertAmountTo]
              : oracleToken.id === vault.oracleId
              ? vault.assetIds
              : [oracleToken.id]
          }
          alt={oracleToken.id}
        />
      </Box>
      <Box flexGrow={1} pl={1} lineHeight={0}>
        <Typography className={classes.assetCount} variant={'body1'}>
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
        </Typography>
      </Box>
    </Box>
  );
}
