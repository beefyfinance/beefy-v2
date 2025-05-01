import { styled } from '@repo/styles/jsx';
import { Fragment, memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type InterestTooltipContentProps = {
  rows: {
    label: string | string[];
    value: string;
    labelTextParams?: Record<string, string>;
  }[];
  highLightLast?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
};

export const InterestTooltipContent = memo(function InterestTooltipContent({
  header,
  footer,
  rows,
  highLightLast = true,
}: InterestTooltipContentProps) {
  const { t } = useTranslation();
  const lastIndex = rows.length - 1;

  return (
    <Group>
      {header && <Header>{header}</Header>}
      <Rows>
        {rows.map(({ label, value, labelTextParams }, index) => (
          <Fragment key={`${typeof label === 'string' ? label : label[0]}-${index}`}>
            <Label highlight={highLightLast && lastIndex == index}>
              {t(label, labelTextParams)}
            </Label>
            <Value highlight={highLightLast && lastIndex == index}>{t(value)}</Value>
          </Fragment>
        ))}
      </Rows>
      {footer && <Footer>{footer}</Footer>}
    </Group>
  );
});

const Group = styled('div', {
  base: {
    textStyle: 'body',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '0',
  },
});

const Header = styled('div', {
  base: {
    color: 'colorPalette.text.title',
    textStyle: 'body.bold',
  },
});

const Footer = styled('div', {
  base: {
    color: 'colorPalette.text.footer',
    textStyle: 'body.sm.medium',
    maxWidth: '280px',
    marginTop: '8px',
  },
});

const Rows = styled('div', {
  base: {
    textStyle: 'body',
    display: 'grid',
    rowGap: '0',
    columnGap: '48px',
    gridTemplateColumns: '1fr auto',
  },
});

const Label = styled('div', {
  base: {
    color: 'colorPalette.text.label',
  },
  variants: {
    highlight: {
      true: {
        color: 'colorPalette.text.highlight',
        fontWeight: 'medium',
      },
    },
  },
});

const Value = styled('div', {
  base: {
    color: 'colorPalette.text.item',
    textAlign: 'right',
  },
  variants: {
    highlight: {
      true: {
        color: 'colorPalette.text.highlight',
        fontWeight: 'medium',
      },
    },
  },
});
