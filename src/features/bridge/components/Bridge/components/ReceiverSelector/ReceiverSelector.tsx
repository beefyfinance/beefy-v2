import { type ChangeEventHandler, memo, useCallback, useMemo } from 'react';
import { InputBase, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectBridgeFormState } from '../../../../../data/selectors/bridge';
import clsx from 'clsx';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge';
import { isAddress } from 'viem';
import { selectChainById } from '../../../../../data/selectors/chains';
import {
  LabelledCheckbox,
  type LabelledCheckboxProps,
} from '../../../../../../components/LabelledCheckbox';

const useStyles = makeStyles(styles);

type ReceiverSelectorProps = {
  className?: string;
};

export const ReceiverSelector = memo<ReceiverSelectorProps>(function ReceiverSelector({
  className,
}) {
  const dispatch = useAppDispatch();
  const classes = useStyles();
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
    <div className={clsx(classes.group, className)}>
      <LabelledCheckbox
        checkboxClass={classes.checkbox}
        labelClass={classes.label}
        iconClass={classes.check}
        checkedClass={classes.checked}
        label={`My ${chain.name} address is different`}
        checked={receiverIsDifferent}
        onChange={handleReceiverToggle}
      />
      {receiverIsDifferent ? (
        <InputBase
          className={clsx(classes.input)}
          value={receiverAddress || ''}
          onChange={handleAddressChange}
          error={addressError !== undefined}
          placeholder="0x...."
        />
      ) : null}
    </div>
  );
});
