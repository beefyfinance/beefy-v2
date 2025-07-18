import { styled } from '@repo/styles/jsx';
import { type CSSProperties, memo } from 'react';

export const ProgressBar = memo(function ProgressBar({ progress }: { progress: number }) {
  return (
    <Sizer style={{ '--progress': `${progress}%` } as CSSProperties}>
      <ShadowGlowCropper>
        <ShadowGlowSizer>
          <GlowSizer>
            <GlowTop />
            <GlowBottom />
          </GlowSizer>
          <Shadow />
        </ShadowGlowSizer>
      </ShadowGlowCropper>
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

const ShadowGlowCropper = styled('div', {
  base: {
    position: 'absolute',
    top: '0',
    left: '0',
    height: '80px',
    width: '100%',
    overflow: 'hidden',
  },
});

const ShadowGlowSizer = styled('div', {
  base: {
    position: 'absolute',
    top: '-2px',
    left: '-40px',
    transform: 'translateY(-50%)',
    height: '38px',
    width: 'calc(100% + 80px)',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    padding: '8px',
  },
});

const GlowSizer = styled('div', {
  base: {
    position: 'relative',
    flex: '0 0 auto',
    width: 'calc(var(--progress, 0%) + 40px - 4px)',
    transition: 'width 0.2s linear',
  },
});

const GlowTop = styled('div', {
  base: {
    position: 'absolute',
    top: '0',
    left: '0',
    height: '100%',
    width: '100%',
    background: 'green.40',
    filter: 'blur(15px)',
  },
});

const GlowBottom = styled('div', {
  base: {
    background: 'green.40',
    opacity: '0.5',
    filter: 'blur(6px)',
  },
});

const Shadow = styled('div', {
  base: {
    flex: '1 0 0',
    backgroundColor: 'darkBlue.90-56a',
    filter: 'blur(12px)',
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
