import { memo, type ReactNode } from 'react';
import { useAppSelector } from '../../../../../../store.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';
import { Button } from '../../../../../../components/Button/Button.tsx';

type ActionButtonProps = {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  variant?: 'boost' | 'default' | 'success';
};

export const ActionButton = memo(function ActionButton({
  disabled,
  onClick,
  children,
  variant = 'boost',
}: ActionButtonProps) {
  const isStepping = useAppSelector(selectIsStepperStepping);

  return (
    <Button
      disabled={disabled || isStepping}
      onClick={onClick}
      fullWidth={true}
      borderless={true}
      variant={variant}
    >
      {children}
    </Button>
  );
});
