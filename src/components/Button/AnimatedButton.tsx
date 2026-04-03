import { type ComponentProps, memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  useRive,
  useViewModelInstanceBoolean,
  useViewModelInstanceTrigger,
  Layout,
  Fit,
  Alignment,
} from '@rive-app/react-canvas';
import { css } from '@repo/styles/css';
import buttonRiv from '../../images/animations/cow_only.riv';
import { Button } from './Button.tsx';

const LAYOUT = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.TopRight,
  layoutScaleFactor: 4,
});

const STATE_MACHINE_NAME = 'State Machine 1';

type AnimatedButtonProps = ComponentProps<typeof Button> & {
  loading?: boolean;
  isCreating?: boolean;
  needFire?: boolean;
  isConfirmed?: boolean;
};

type RiveAnimationProps = {
  depositInProgress: boolean;
  fireNeedFire: boolean;
  fireIsFired: boolean;
  isConfirmed: boolean;
};

const RiveAnimation = memo(function RiveAnimation({
  depositInProgress,
  fireNeedFire,
  fireIsFired,
  isConfirmed,
}: RiveAnimationProps) {
  const { rive, RiveComponent } = useRive({
    src: buttonRiv,
    stateMachines: STATE_MACHINE_NAME,
    layout: LAYOUT,
    autoplay: true,
    autoBind: true,
  });

  const vmi = rive?.viewModelInstance;

  const { setValue: setInProgress } = useViewModelInstanceBoolean('isInProgress', vmi);
  const { trigger: triggerNeedFire } = useViewModelInstanceTrigger('needFire', vmi);
  const { trigger: triggerIsFired } = useViewModelInstanceTrigger('isFired', vmi);
  const { setValue: setIsConfirmed } = useViewModelInstanceBoolean('isConfirmed', vmi);

  // Track previous values to only fire triggers on rising edge
  const prevRef = useRef({ fireNeedFire: false, fireIsFired: false });

  useEffect(() => {
    setInProgress(depositInProgress);
  }, [setInProgress, depositInProgress]);

  useEffect(() => {
    if (fireNeedFire && !prevRef.current.fireNeedFire) {
      triggerNeedFire();
    }
    prevRef.current.fireNeedFire = fireNeedFire;
  }, [triggerNeedFire, fireNeedFire]);

  useEffect(() => {
    if (fireIsFired && !prevRef.current.fireIsFired) {
      triggerIsFired();
    }
    prevRef.current.fireIsFired = fireIsFired;
  }, [triggerIsFired, fireIsFired]);

  useEffect(() => {
    setIsConfirmed(isConfirmed);
  }, [setIsConfirmed, isConfirmed]);

  return <RiveComponent style={{ width: '100%', height: '100%' }} />;
});

export const AnimatedButton = memo(function AnimatedButton({
  loading,
  children,
  disabled,
  isCreating,
  needFire,
  isConfirmed,
  onClick,
  ...props
}: AnimatedButtonProps) {
  const [isFired, setIsFired] = useState(false);

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    e => {
      if (needFire) {
        setIsFired(true);
      }
      onClick?.(e);
    },
    [needFire, onClick]
  );

  // Reset isFired when needFire goes away
  useEffect(() => {
    if (!needFire) {
      setIsFired(false);
    }
  }, [needFire]);

  const showCow = !!isCreating || !!loading || !!needFire || isFired || !!isConfirmed;

  return (
    <div className={wrapperClass}>
      <Button {...props} disabled={loading || disabled} onClick={handleClick}>
        {children}
      </Button>
      {showCow && (
        <div className={riveCornerClass}>
          <RiveAnimation
            depositInProgress={(!!loading && !isCreating) || !!needFire || isFired}
            fireNeedFire={!!needFire}
            fireIsFired={isFired}
            isConfirmed={!!isConfirmed}
          />
        </div>
      )}
    </div>
  );
});

const wrapperClass = css({
  position: 'relative',
  width: '100%',
});

const riveCornerClass = css({
  position: 'absolute',
  bottom: '0',
  right: '0',
  width: '250%',
  height: '250%',
  pointerEvents: 'none',
});
