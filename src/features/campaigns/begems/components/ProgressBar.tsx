import { styled } from '@repo/styles/jsx';
import { type CSSProperties, memo } from 'react';

export const ProgressBar = memo(function ProgressBar({ progress }: { progress: number }) {
  return (
    <Sizer style={{ '--progress': `${progress}%` } as CSSProperties}>
      <GlowLeft />
      <GlowRight />
      <Bar />
      <DotOuter>
        <DotInner />
      </DotOuter>
    </Sizer>
  );
});

const Sizer = styled('div', {
  base: {
    width: '100%',
    height: '2px',
    position: 'relative',
  },
});

const Bar = styled('div', {
  base: {
    position: 'absolute',
    left: '0',
    top: '0',
    height: '100%',
    width: 'var(--progress, 0%)',
    transition: 'width 0.2s linear',
    background: 'green',
  },
});

const GlowLeft = styled('div', {
  base: {
    position: 'absolute',
    top: '0',
    left: '0',
    background:
      'linear-gradient(180deg, rgba(113, 207, 132, 0.25) 0%, rgba(113, 207, 132, 0.00) 55%)',
    height: '41px',
    width: 'calc(var(--progress, 0%) + 0px)',
    transition: 'width 0.2s linear',
  },
});

const GlowRight = styled('div', {
  base: {
    position: 'absolute',
    top: '0',
    left: 'var(--progress, 0%)',
    transition: 'left 0.2s linear',
    background:
      'radial-gradient(50% 50% at 50% 50%, rgba(113, 207, 132, 0.66) 0%, rgba(113, 207, 132, 0.00) 83.82%)',
    backgroundSize: '200% 200%',
    backgroundPosition: '160% 100%',
    backgroundRepeat: 'no-repeat',
    height: '41px',
    width: '100%',
  },
});

const DotOuter = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    width: '39px',
    height: '39px',
    position: 'absolute',
    top: '0',
    left: 'var(--progress, 0%)',
    transition: 'left 0.2s linear',
    background:
      'radial-gradient(50% 50% at 50% 50%, rgba(113, 207, 132, 0.60) 0%, rgba(113, 207, 132, 0.00) 100%), radial-gradient(50% 50% at 50% 50%, rgba(113, 207, 132, 0.66) 0%, rgba(113, 207, 132, 0.00) 83.82%), radial-gradient(50% 50% at 50% 50%, #71CF84 0%, rgba(113, 207, 132, 0.00) 40%)',
  },
});

const DotInner = styled('div', {
  base: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    background:
      'linear-gradient(0deg, #FEFEFE 0%, #FEFEFE 100%), radial-gradient(50% 50% at 50% 50%, rgba(113, 207, 132, 0.66) 0%, rgba(113, 207, 132, 0.00) 83.82%), radial-gradient(50% 50% at 50% 50%, #71CF84 0%, rgba(113, 207, 132, 0.00) 40%)',
  },
});
