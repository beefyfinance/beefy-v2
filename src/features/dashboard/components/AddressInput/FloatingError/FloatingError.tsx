import { memo, type MutableRefObject, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownProvider } from '../../../../../components/Dropdown/DropdownProvider.tsx';
import { DropdownContent } from '../../../../../components/Dropdown/DropdownContent.tsx';

interface FloatingErrorProps {
  userInput: string;
  inputMode: 'address' | 'domain';
  isAddressValid: boolean;
  isDomainValid: boolean;
  isDomainResolving: boolean;
  anchorRef: RefObject<HTMLInputElement> | MutableRefObject<HTMLInputElement>;
}

export const FloatingError = memo(function FloatingError({
  userInput,
  inputMode,
  isAddressValid,
  isDomainValid,
  isDomainResolving,
  anchorRef,
}: FloatingErrorProps) {
  const { t } = useTranslation();

  if (!isDomainResolving && inputMode === 'domain') {
    return (
      <DropdownProvider
        open={!isDomainValid}
        placement="bottom-start"
        reference={anchorRef}
        arrowEnabled={true}
        variant="dark"
        autoWidth={true}
        arrowOffset={15}
      >
        <DropdownContent>{t('Dashboard-SearchInput-Invalid-Domain')}</DropdownContent>
      </DropdownProvider>
    );
  }

  if (inputMode === 'address' && userInput.toLowerCase().startsWith('0x')) {
    return (
      <DropdownProvider
        open={!isAddressValid}
        placement="bottom-start"
        reference={anchorRef}
        arrowEnabled={true}
        variant="dark"
        autoWidth={true}
        arrowOffset={15}
      >
        <DropdownContent>{t('Dashboard-SearchInput-Invalid-Address')}</DropdownContent>
      </DropdownProvider>
    );
  }

  return null;
});
