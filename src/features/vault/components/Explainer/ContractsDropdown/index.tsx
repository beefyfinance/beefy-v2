import { memo, useCallback, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { Button } from '../../../../../components/Button';
import { useTranslation } from 'react-i18next';
import { ExpandMore, OpenInNewRounded } from '@material-ui/icons';
import { ClickAwayListener, makeStyles, type Theme } from '@material-ui/core';
import { Floating } from '../../../../../components/Floating';
import clsx from 'clsx';

interface ContractsDropdownProps {
  links: { label: string; link: string }[];
}

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.middle,
    padding: '2px 8px',
    justifyContent: 'space-between',
    gap: '2px',
  },
  selectIcon: {
    height: '18px',
  },
  isOpen: {
    '& $selectIcon': {
      transform: 'rotate(180deg)',
    },
  },
  dropdown: {
    padding: '2px 8px',
    backgroundColor: theme.palette.background.buttons.button,
    borderRadius: '4px',
    minWidth: '142px',
  },
  linkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  link: {
    ...theme.typography['body-lg'],
    textDecoration: 'none',
    color: theme.palette.text.dark,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.text.primary,
    },
  },
}));

export const ContractsDropdown = memo<ContractsDropdownProps>(function ContractsDropdown({
  links,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const anchorEl = useRef<HTMLButtonElement>();

  const handleChange = useCallback(() => {
    setOpen(value => !value);
  }, []);

  return (
    <>
      <Button
        className={clsx(classes.button, { [classes.isOpen]: open })}
        ref={anchorEl as RefObject<HTMLButtonElement>}
        onClick={handleChange}
      >
        {t('Contracts')}
        <ExpandMore className={classes.selectIcon} />
      </Button>
      <Floating
        open={open}
        anchorEl={anchorEl as MutableRefObject<HTMLElement>}
        className={classes.dropdown}
        autoWidth={false}
        placement="bottom-end"
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <div className={classes.linkList}>
            {links.map(({ label, link }) => (
              <a className={classes.link} key={label} href={link} target="_blank" rel="noopener">
                {label}
                <OpenInNewRounded fontSize="inherit" />
              </a>
            ))}
          </div>
        </ClickAwayListener>
      </Floating>
    </>
  );
});
