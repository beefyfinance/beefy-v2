import { css, type CssStyles, cx } from '@repo/styles/css';
import { memo, useCallback, useMemo } from 'react';
import { ListJoin } from '../../../../../../../components/ListJoin.tsx';
import { TokenAmountFromEntity } from '../../../../../../../components/TokenAmount/TokenAmount.tsx';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../../data/store/hooks.ts';
import ChevronRight from '../../../../../../../images/icons/mui/ChevronRight.svg?react';
import { selectTransactQuoteById } from '../../../../../../data/selectors/transact.ts';
import { QuoteTitle } from '../../QuoteTitle/QuoteTitle.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type ListItemProps = {
  quoteId: string;
  onSelect: (id: string) => void;
  css?: CssStyles;
};
export const ListItem = memo(function ListItem({ quoteId, css: cssProp, onSelect }: ListItemProps) {
  const classes = useStyles();
  const quote = useAppSelector(state => selectTransactQuoteById(state, quoteId));
  const handleClick = useCallback(() => onSelect(quoteId), [onSelect, quoteId]);
  const outputs = useMemo(
    () =>
      quote.outputs.map(output => (
        <TokenAmountFromEntity token={output.token} amount={output.amount} key={output.token.id} />
      )),
    [quote]
  );

  return (
    <button type="button" className={css(styles.item, cssProp)} onClick={handleClick}>
      <QuoteTitle quote={quote} css={styles.provider} />
      <div>
        <ListJoin items={outputs} />
      </div>
      <ChevronRight className={cx('item-arrow', classes.arrow)} />
    </button>
  );
});
