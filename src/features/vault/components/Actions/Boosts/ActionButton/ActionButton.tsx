import { memo, type ReactNode } from 'react';
import { useAppSelector } from '../../../../../../store';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';
import { Button } from '../../../../../../components/Button';

type ActionButtonProps = {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
};

export const ActionButton = memo(function ActionButton({
  disabled,
  onClick,
  children,
}: ActionButtonProps) {
  const isStepping = useAppSelector(selectIsStepperStepping);

  return (
    <Button
      disabled={disabled || isStepping}
      onClick={onClick}
      fullWidth={true}
      borderless={true}
      variant="boost"
    >
      {children}
    </Button>
  );
});
