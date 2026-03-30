import { type ComponentProps, memo, useEffect } from 'react';
import { useRive, Layout, Fit, Alignment, EventType } from '@rive-app/react-canvas';
import { css } from '@repo/styles/css';
import buttonRiv from '../../images/animations/cow-animation.riv';
import { Button } from './Button.tsx';

const LAYOUT = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.TopRight,
  layoutScaleFactor: 4,
});

type AnimatedButtonProps = ComponentProps<typeof Button> & {
  loading?: boolean;
  animation?: boolean;
};

const RiveAnimation = memo(function RiveAnimation() {
  const { rive, RiveComponent } = useRive({
    src: buttonRiv,
    layout: LAYOUT,
    autoplay: true,
  });

  useEffect(() => {
    if (!rive) return;
    const onStop = () => rive.play();
    rive.on(EventType.Stop, onStop);
    return () => rive.off(EventType.Stop, onStop);
  }, [rive]);

  return <RiveComponent style={{ width: '100%', height: '100%' }} />;
});

export const AnimatedButton = memo(function AnimatedButton({
  loading,
  children,
  disabled,
  animation,
  ...props
}: AnimatedButtonProps) {
  return (
    <div className={wrapperClass}>
      <Button {...props} disabled={loading || disabled}>
        {children}
      </Button>
      {(loading || animation) && (
        <div className={riveCornerClass}>
          <RiveAnimation />
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
