import { css, type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectQuoteError, selectQuoteStatus } from '../../../../../data/selectors/on-ramp.ts';
import { ProviderSelect } from '../ProviderSelect/ProviderSelect.tsx';
import { styles } from './styles.ts';

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
      {status === 'rejected' ?
        <Rejected />
      : <ProviderSelect pending={status !== 'fulfilled'} />}
    </div>
  );
});
