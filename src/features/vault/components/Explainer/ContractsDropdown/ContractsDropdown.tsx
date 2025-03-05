import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMore from '../../../../../images/icons/mui/ExpandMore.svg?react';
import OpenInNewRounded from '../../../../../images/icons/mui/OpenInNewRounded.svg?react';
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

export const ContractsDropdown = memo(function ContractsDropdown({
  links,
}: ContractsDropdownProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <DropdownProvider variant="button" placement="bottom-end" open={open} onChange={setOpen}>
      <DropdownButtonTrigger size="sm" borderless={true}>
        {t('Contracts')}
        <ExpandMore />
      </DropdownButtonTrigger>
      <DropdownContent padding="small" gap="small">
        {links.map(({ label, link }) => (
          <DropdownLink key={label} label={label} link={link} />
        ))}
      </DropdownContent>
    </DropdownProvider>
  );
});

const linkClass = css({
  textStyle: 'body',
  lineHeight: '1',
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
});

const iconClass = css({
  fontSize: 'inherit',
});

const DropdownLink = memo(function DropdownLink({ label, link }: { label: string; link: string }) {
  return (
    <a className={linkClass} href={link} target="_blank">
      {label}
      <OpenInNewRounded className={iconClass} />
    </a>
  );
});
