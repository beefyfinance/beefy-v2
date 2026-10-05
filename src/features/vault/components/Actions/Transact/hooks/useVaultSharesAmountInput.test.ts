import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import {
  mooAmountToOracleAmount,
  oracleAmountToMooAmount,
} from '../../../../../data/utils/ppfs.ts';
import { vaultSharesInputValue } from './useVaultSharesAmountInput.ts';

const shareToken = { decimals: 18 } as TokenEntity;
const depositToken = { decimals: 18 } as TokenEntity;
const ppfs = new BigNumber('1.093265599366966963');
const entered = new BigNumber(1);
const sharesFromEntered = oracleAmountToMooAmount(shareToken, depositToken, ppfs, entered);

describe('vaultSharesInputValue', () => {
  it('shows the entered amount while the stored shares came from it', () => {
    expect(
      mooAmountToOracleAmount(shareToken, depositToken, ppfs, sharesFromEntered).eq(entered)
    ).toBe(false);
    expect(
      vaultSharesInputValue(shareToken, depositToken, ppfs, sharesFromEntered, entered).toString(10)
    ).toBe('1');
  });

  it('shows the stored shares in the deposit token once they no longer come from the entry', () => {
    const shareBalance = new BigNumber(5);
    expect(vaultSharesInputValue(shareToken, depositToken, ppfs, shareBalance, entered)).toEqual(
      mooAmountToOracleAmount(shareToken, depositToken, ppfs, shareBalance)
    );
  });

  it('shows the stored shares in the deposit token when nothing was entered', () => {
    expect(
      vaultSharesInputValue(shareToken, depositToken, ppfs, sharesFromEntered, undefined)
    ).toEqual(mooAmountToOracleAmount(shareToken, depositToken, ppfs, sharesFromEntered));
  });
});
