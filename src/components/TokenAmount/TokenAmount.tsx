import { memo } from 'react';
import { formatTokenDisplay, formatTokenDisplayCondensed } from '../../helpers/format.ts';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent.tsx';
import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { DivWithTooltip } from '../Tooltip/DivWithTooltip.tsx';

export type TokenAmountProps = {
  amount: BigNumber;
  decimals: number;
  css?: CssStyles;
  onClick?: () => void;
  disableTooltip?: boolean;
};
export const TokenAmount = memo(function TokenAmount({
  amount,
  decimals,
  css: cssProp,
  onClick,
  disableTooltip,
}: TokenAmountProps) {
  const fullAmount = formatTokenDisplay(amount, decimals);
  const shortAmount = formatTokenDisplayCondensed(amount, decimals);
  const needTooltip = shortAmount.length < fullAmount.length;

  return (
    needTooltip ?
      disableTooltip ?
        <span onClick={onClick} className={css(cssProp, onClick && styles.withOnClick)}>
          {shortAmount}
        </span>
      : <DivWithTooltip
          onClick={onClick}
          className={css(styles.withTooltip, onClick && styles.withOnClick, cssProp)}
          tooltip={<BasicTooltipContent title={fullAmount} />}
        >
          {shortAmount}
        </DivWithTooltip>
    : <span onClick={onClick} className={css(cssProp, onClick && styles.withOnClick)}>
        {fullAmount}
      </span>
  );
});

export type TokenAmountFromEntityProps = Omit<TokenAmountProps, 'decimals'> & {
  token: TokenEntity;
};

export const TokenAmountFromEntity = memo(function TokenAmountFromEntity({
  token,
  ...rest
}: TokenAmountFromEntityProps) {
  return <TokenAmount decimals={token.decimals} {...rest} />;
});
