import { memo, type ReactNode } from 'react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';

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
