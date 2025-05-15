import { css, type CssStyles } from '@repo/styles/css';
import { type ChangeEventHandler, memo, useCallback, useMemo } from 'react';
import { isAddress } from 'viem';
import { BaseInput } from '../../../../../../components/Form/Input/BaseInput.tsx';
import type { LabelledCheckboxProps } from '../../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge.ts';
import { selectBridgeFormState } from '../../../../../data/selectors/bridge.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { styles } from './styles.ts';

type ReceiverSelectorProps = {
  css?: CssStyles;
};

export const ReceiverSelector = memo(function ReceiverSelector({
  css: cssProp,
}: ReceiverSelectorProps) {
  const dispatch = useAppDispatch();
  const { receiverAddress, receiverIsDifferent, to } = useAppSelector(selectBridgeFormState);
  const chain = useAppSelector(state => selectChainById(state, to));
  const addressError = useMemo(() => {
    if (receiverIsDifferent) {
      if (!receiverAddress) {
        return 'Address is required';
      }
      if (!isAddress(receiverAddress, { strict: true })) {
        return 'Invalid address';
      }
    }
    return undefined;
  }, [receiverIsDifferent, receiverAddress]);
  const handleAddressChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      dispatch(bridgeActions.setReceiverAddress(e.target.value));
    },
    [dispatch]
  );
  const handleReceiverToggle = useCallback<LabelledCheckboxProps['onChange']>(
    checked => {
      dispatch(bridgeActions.setReceiverIsDifferent(checked));
    },
    [dispatch]
  );

  return (
    <div className={css(styles.group, cssProp)}>
      <LabelledCheckbox
        labelCss={styles.label}
        iconCss={styles.check}
        checkedIconCss={styles.checkedIcon}
        label={`My ${chain.name} address is different`}
        checked={receiverIsDifferent}
        onChange={handleReceiverToggle}
      />
      {receiverIsDifferent ?
        <BaseInput
          className={css(styles.input)}
          value={receiverAddress || ''}
          onChange={handleAddressChange}
          error={addressError !== undefined}
          placeholder="0x...."
        />
      : null}
    </div>
  );
});
