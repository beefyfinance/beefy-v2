import { memo, useCallback, useRef } from 'react';
import FileCopy from '../../images/icons/CopyToClipboard.svg?react';
import { cx, sva } from '@repo/styles/css';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.ts';

type CopyTextProps = {
  className?: string;
  value: string;
};

const copyTextRecipe = sva({
  slots: ['root', 'input', 'button'],
  base: {
    root: {
      position: 'relative',
    },
    input: {
      lineHeight: '20px',
      background: 'searchInput.background',
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      borderRadius: '8px',
      width: '100%',
      display: 'flex',
      cursor: 'default',
      padding: '12px 48px 12px 16px',
      color: 'searchInput.text',
      height: 'auto',
    },
    button: {
      position: 'absolute',
      top: 0,
      right: 0,
      height: '100%',
      background: 'none',
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      cursor: 'pointer',
      color: 'text.middle',
      padding: '1px 12px 1px 6px',
      '&:hover': {
        color: 'text.light',
      },
    },
  },
  variants: {
    status: {
      idle: {},
      pending: {},
      success: {
        button: {
          color: 'indicators.success.fg',
        },
      },
      error: {
        button: {
          color: 'indicators.error.fg',
        },
      },
    },
  },
  defaultVariants: {
    status: 'idle',
  },
});

export const CopyText = memo<CopyTextProps>(function CopyText({ className, value }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { copy, status } = useCopyToClipboard();
  const classes = copyTextRecipe({ status });

  const handleCopy = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
    if (value.length) {
      copy(value);
    }
  }, [copy, value]);

  return (
    <div className={cx(classes.root, className)}>
      <input type="text" readOnly className={classes.input} value={value} ref={inputRef} />
      <button
        type="button"
        className={classes.button}
        onClick={handleCopy}
        disabled={value.length === 0 || status === 'pending'}
      >
        <FileCopy />
      </button>
    </div>
  );
});
