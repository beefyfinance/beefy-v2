import { memo, type ReactNode } from 'react';
import { useAppSelector } from '../../../../../../store.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';
import { Button } from '../../../../../../components/Button/Button.tsx';

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
