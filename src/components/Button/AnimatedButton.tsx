import { type ComponentProps, memo, useCallback, useEffect, useState } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { css } from '@repo/styles/css';
import buttonRiv from '../../images/animations/cow-animation.riv';
import { Button } from './Button.tsx';

const LAYOUT = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.TopRight,
  layoutScaleFactor: 4,
});

const STATE_MACHINE_NAME = 'State Machine 1';

type AnimatedButtonProps = ComponentProps<typeof Button> & {
  loading?: boolean;
  animation?: boolean;
  needFire?: boolean;
};

type RiveAnimationProps = {
  hovering: boolean;
  depositInProgress: boolean;
  needFire: boolean;
  isFired: boolean;
};

const RiveAnimation = memo(function RiveAnimation({
  hovering,
  depositInProgress,
  needFire,
  isFired,
}: RiveAnimationProps) {
  const { rive, RiveComponent } = useRive({
    src: buttonRiv,
    stateMachines: STATE_MACHINE_NAME,
    layout: LAYOUT,
    autoplay: true,
  });

  const risingInput = useStateMachineInput(rive, STATE_MACHINE_NAME, 'isRising');
  const depositInput = useStateMachineInput(rive, STATE_MACHINE_NAME, 'isInProgress');
  const needFireInput = useStateMachineInput(rive, STATE_MACHINE_NAME, 'needFire');
  const isFiredInput = useStateMachineInput(rive, STATE_MACHINE_NAME, 'isFired');

  useEffect(() => {
    if (risingInput) {
      risingInput.value = hovering;
    }
  }, [risingInput, hovering]);

  useEffect(() => {
    if (!depositInput) return;
    depositInput.value = depositInProgress;
    if (!depositInProgress) return;

    // The state machine resets the boolean after the animation plays once.
    // Poll and re-trigger to keep it looping while depositInProgress is true.
    const id = setInterval(() => {
      if (!depositInput.value) {
        depositInput.value = true;
      }
    }, 150);
    return () => clearInterval(id);
  }, [depositInput, depositInProgress]);

  useEffect(() => {
    if (needFireInput) {
      needFireInput.value = needFire;
    }
  }, [needFireInput, needFire]);

  useEffect(() => {
    if (isFiredInput) {
      isFiredInput.value = isFired;
    }
  }, [isFiredInput, isFired]);

  return <RiveComponent style={{ width: '100%', height: '100%' }} />;
});

export const AnimatedButton = memo(function AnimatedButton({
  loading,
  children,
  disabled,
  animation: _animation,
  needFire,
  onClick,
  ...props
}: AnimatedButtonProps) {
  const [hovering, setHovering] = useState(false);
  const [isFired, setIsFired] = useState(false);

  const handleMouseEnter = useCallback(() => setHovering(true), []);
  const handleMouseLeave = useCallback(() => setHovering(false), []);

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

  return (
    <div className={wrapperClass} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Button {...props} disabled={loading || disabled} onClick={handleClick}>
        {children}
      </Button>
      <div className={riveCornerClass}>
        <RiveAnimation
          hovering={hovering}
          depositInProgress={!!loading}
          needFire={!!needFire}
          isFired={isFired}
        />
      </div>
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
