import { memo } from 'react';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { useAppSelector } from '../../../../../../store.ts';
import { selectQuoteError, selectQuoteStatus } from '../../../../../data/selectors/on-ramp.ts';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { ProviderSelect } from '../ProviderSelect/ProviderSelect.tsx';

const Rejected = memo(function Rejected() {
  const error = useAppSelector(selectQuoteError);
  return <AlertError>{error.message}</AlertError>;
});

export type QuoteBestProps = {
  css?: CssStyles;
};
export const QuoteBest = memo(function QuoteBest({ css: cssProp }: QuoteBestProps) {
  const status = useAppSelector(selectQuoteStatus);

  return (
    <div className={css(styles.container, cssProp)}>
      {status === 'rejected' ? <Rejected /> : <ProviderSelect pending={status !== 'fulfilled'} />}
    </div>
  );
});
