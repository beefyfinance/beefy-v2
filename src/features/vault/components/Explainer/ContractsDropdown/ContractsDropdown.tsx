import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMore from '../../../../../images/icons/mui/ExpandMore.svg?react';
import OpenInNewRounded from '../../../../../images/icons/mui/OpenInNewRounded.svg?react';
import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import { css } from '@repo/styles/css';
import { DropdownProvider } from '../../../../../components/Dropdown/DropdownProvider.tsx';
import { DropdownButtonTrigger } from '../../../../../components/Dropdown/DropdownTrigger.tsx';
import { DropdownContent } from '../../../../../components/Dropdown/DropdownContent.tsx';

interface ContractsDropdownProps {
  links: {
    label: string;
    link: string;
  }[];
}

const styles = {
  button: css.raw({
    textStyle: 'body',
    color: 'text.middle',
    padding: '2px 8px',
    justifyContent: 'space-between',
    gap: '4px',
    borderRadius: '4px',
    height: '28px',
  }),
  selectIcon: css.raw({
    height: '18px',
  }),
  selectOpenIcon: css.raw({
    transform: 'rotate(180deg)',
  }),
  dropdown: css.raw({
    padding: '2px 8px',
    backgroundColor: 'bayOfMany',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
  }),
  link: css.raw({
    textStyle: 'body',
    textDecoration: 'none',
    color: 'text.dark',
    minWidth: '106px',
    width: 'max-content',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    _hover: {
      cursor: 'pointer',
      color: 'text.lightest',
    },
  }),
  icon: css.raw({
    fontSize: 'inherit',
  }),
};
const useStyles = legacyMakeStyles(styles);

export const ContractsDropdown = memo(function ContractsDropdown({
  links,
}: ContractsDropdownProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleChange = useCallback(() => {
    setOpen(value => !value);
  }, []);

  return (
    <DropdownProvider variant="dark" placement="bottom-end">
      <DropdownButtonTrigger css={css.raw(styles.button)} onClick={handleChange}>
        {t('Contracts')}
        <ExpandMore className={css(styles.selectIcon, open && styles.selectOpenIcon)} />
      </DropdownButtonTrigger>
      <DropdownContent>
        {links.map(({ label, link }) => (
          <a className={classes.link} key={label} href={link} target="_blank">
            {label}
            <OpenInNewRounded className={classes.icon} />
          </a>
        ))}
      </DropdownContent>
    </DropdownProvider>
  );
});
