import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { formatBigDecimals } from '../../../../../../../helpers/format';
import { ChainEntity } from '../../../../../../data/entities/chain';
import clsx from 'clsx';
import { TokenEntity } from '../../../../../../data/entities/token';
import BigNumber from 'bignumber.js';
import { ChevronRight } from '@material-ui/icons';
import { TokensImage } from '../../../../../../../components/TokenImage/TokenImage';
import { ListJoin } from '../../../../../../../components/ListJoin';
import { useAppSelector } from '../../../../../../../store';
import {
  selectTransactOptionById,
  selectTransactQuoteById,
} from '../../../../../../data/selectors/transact';
import { ZapProvider } from '../../ZapProvider';
import { TokenAmount, TokenAmountFromEntity } from '../../../../../../../components/TokenAmount';

const useStyles = makeStyles(styles);

export type ListItemProps = {
  quoteId: string;
  onSelect: (id: string) => void;
  className?: string;
};
export const ListItem = memo<ListItemProps>(function ({ quoteId, className, onSelect }) {
  const classes = useStyles();
  const quote = useAppSelector(state => selectTransactQuoteById(state, quoteId));
  const option = useAppSelector(state => selectTransactOptionById(state, quote.optionId));
  const handleClick = useCallback(() => onSelect(quoteId), [onSelect, quoteId]);
  const outputs = useMemo(
    () =>
      quote.outputs.map(output => (
        <TokenAmountFromEntity token={output.token} amount={output.amount} />
      )),
    [quote]
  );

  return (
    <button className={clsx(classes.item, className)} onClick={handleClick}>
      <ZapProvider providerId={option.providerId} className={classes.provider} />
      <div className={classes.output}>
        <ListJoin items={outputs} />
      </div>
      <ChevronRight className={classes.arrow} />
    </button>
  );
});
