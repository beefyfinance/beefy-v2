export const DEFAULT_SIZE = 48;

export const styles = () => ({
  icon: {
    width: `${DEFAULT_SIZE}px`,
    height: `${DEFAULT_SIZE}px`,
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    flexShrink: 0,
    flexGrow: 0,
    transform: 'translate(0, 0)', // new zIndex context
    '&[data-count="2"]': {
      '& $iconImg': {
        position: 'absolute' as const,
        width: `${((32 / 48) * 100).toFixed(4)}%`,
        height: `${((32 / 48) * 100).toFixed(4)}%`,
        '&:nth-child(1)': {
          left: 0,
          zIndex: 2,
        },
        '&:nth-child(2)': {
          right: 0,
          zIndex: 1,
        },
      },
    },
    '&[data-count="3"]': {
      '& $iconImg': {
        position: 'absolute' as const,
        width: `${((28 / 48) * 100).toFixed(4)}%`,
        height: `${((28 / 48) * 100).toFixed(4)}%`,
        '&:nth-child(1)': {
          top: `${((2 / 48) * 100).toFixed(4)}%`,
          left: 0,
          zIndex: 3,
        },
        '&:nth-child(2)': {
          top: `${((2 / 48) * 100).toFixed(4)}%`,
          right: 0,
          zIndex: 1,
        },
        '&:nth-child(3)': {
          bottom: `${((2 / 48) * 100).toFixed(4)}%`,
          left: 0,
          right: 0,
          marginLeft: 'auto',
          marginRight: 'auto',
          zIndex: 2,
        },
      },
    },
    '&[data-count="4"]': {
      '& $iconImg': {
        position: 'absolute' as const,
        width: `${((26 / 48) * 100).toFixed(4)}%`,
        height: `${((26 / 48) * 100).toFixed(4)}%`,
        '&:nth-child(1)': {
          top: 0,
          left: 0,
          zIndex: 4,
        },
        '&:nth-child(2)': {
          top: 0,
          right: 0,
          zIndex: 3,
        },
        '&:nth-child(3)': {
          bottom: 0,
          left: 0,
          zIndex: 2,
        },
        '&:nth-child(4)': {
          bottom: 0,
          right: 0,
          zIndex: 1,
        },
      },
    },
    '&[data-count="5"]': {
      '& $iconImg': {
        position: 'absolute' as const,
        width: `${((24 / 48) * 100).toFixed(4)}%`,
        height: `${((24 / 48) * 100).toFixed(4)}%`,
        '&:nth-child(1)': {
          top: 0,
          left: 0,
        },
        '&:nth-child(2)': {
          top: 0,
          right: 0,
        },
        '&:nth-child(3)': {
          bottom: 0,
          left: 0,
        },
        '&:nth-child(4)': {
          bottom: 0,
          right: 0,
        },
        '&:nth-child(5)': {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
      },
    },
    '&[data-count="6"]': {
      '& $iconImg': {
        position: 'absolute' as const,
        width: `${((24 / 48) * 100).toFixed(4)}%`,
        height: `${((24 / 48) * 100).toFixed(4)}%`,
        '&:nth-child(1)': {
          top: 0,
          left: 0,
          zIndex: 6,
        },
        '&:nth-child(2)': {
          top: 0,
          left: `${((12 / 48) * 100).toFixed(4)}%`,
          zIndex: 5,
        },
        '&:nth-child(3)': {
          top: 0,
          left: `${((24 / 48) * 100).toFixed(4)}%`,
          zIndex: 4,
        },
        '&:nth-child(4)': {
          bottom: 0,
          left: 0,
          zIndex: 3,
        },
        '&:nth-child(5)': {
          bottom: 0,
          left: `${((12 / 48) * 100).toFixed(4)}%`,
          zIndex: 2,
        },
        '&:nth-child(6)': {
          bottom: 0,
          left: `${((24 / 48) * 100).toFixed(4)}%`,
          zIndex: 1,
        },
      },
    },
    '&[data-count="7"]': {
      '& $iconImg': {
        position: 'absolute' as const,
        width: `${((24 / 48) * 100).toFixed(4)}%`,
        height: `${((24 / 48) * 100).toFixed(4)}%`,
        '&:nth-child(1)': {
          top: `${((4 / 48) * 100).toFixed(4)}%`,
          left: 0,
          zIndex: 6,
        },
        '&:nth-child(2)': {
          top: 0,
          left: `${((12 / 48) * 100).toFixed(4)}%`,
          zIndex: 5,
        },
        '&:nth-child(3)': {
          top: `${((4 / 48) * 100).toFixed(4)}%`,
          right: 0,
          zIndex: 4,
        },
        '&:nth-child(4)': {
          bottom: `${((4 / 48) * 100).toFixed(4)}%`,
          right: 0,
          zIndex: 3,
        },
        '&:nth-child(5)': {
          bottom: 0,
          left: `${((12 / 48) * 100).toFixed(4)}%`,
          zIndex: 1,
        },
        '&:nth-child(6)': {
          bottom: `${((4 / 48) * 100).toFixed(4)}%`,
          left: 0,
          zIndex: 2,
        },
        '&:nth-child(7)': {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 7,
        },
      },
    },
    '&[data-count="8"]': {
      '& $iconImg': {
        position: 'absolute' as const,
        width: `${((19 / 48) * 100).toFixed(4)}%`,
        height: `${((19 / 48) * 100).toFixed(4)}%`,
        '&:nth-child(1)': {
          top: `${((8 / 48) * 100).toFixed(4)}%`,
          left: 0,
          zIndex: 8,
        },
        '&:nth-child(2)': {
          top: `${((8 / 48) * 100).toFixed(4)}%`,
          left: `${((10 / 48) * 100).toFixed(4)}%`,
          zIndex: 7,
        },
        '&:nth-child(3)': {
          top: `${((8 / 48) * 100).toFixed(4)}%`,
          left: `${((19 / 48) * 100).toFixed(4)}%`,
          zIndex: 6,
        },
        '&:nth-child(4)': {
          top: `${((8 / 48) * 100).toFixed(4)}%`,
          left: `${((29 / 48) * 100).toFixed(4)}%`,
          zIndex: 5,
        },
        '&:nth-child(5)': {
          bottom: `${((9 / 48) * 100).toFixed(4)}%`,
          left: 0,
          zIndex: 4,
        },
        '&:nth-child(6)': {
          bottom: `${((9 / 48) * 100).toFixed(4)}%`,
          left: `${((10 / 48) * 100).toFixed(4)}%`,
          zIndex: 3,
        },
        '&:nth-child(7)': {
          bottom: `${((9 / 48) * 100).toFixed(4)}%`,
          left: `${((19 / 48) * 100).toFixed(4)}%`,
          zIndex: 2,
        },
        '&:nth-child(8)': {
          bottom: `${((9 / 48) * 100).toFixed(4)}%`,
          left: `${((29 / 48) * 100).toFixed(4)}%`,
          zIndex: 1,
        },
      },
    },
  },
  iconImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
    display: 'block',
  },
  iconImgPlaceholder: {
    backgroundColor: 'magenta',
    border: 'solid 2px black',
    borderRadius: '100%',
  },
});
