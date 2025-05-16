import { css } from '@repo/styles/css';
import { memo } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { selectBoostPartnerById } from '../../../data/selectors/boosts.ts';
import { Socials } from './Socials.tsx';

type PartnerSubCardProps = {
  partnerId: string;
};

export const Partner = memo<PartnerSubCardProps>(function PartnerSubCard({ partnerId }) {
  const { title, text, website, social } = useAppSelector(state =>
    selectBoostPartnerById(state, partnerId)
  );

  return (
    <div className={cardCss}>
      <div className={headerCss}>
        <h4 className={titleCss}>{title}</h4>
        <Socials website={website} socials={social} />
      </div>
      <div className={contentCss}>{text}</div>
    </div>
  );
});

const cardCss = css({
  borderRadius: '12px',
  backgroundColor: 'background.content.light',
});

const headerCss = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  padding: '16px',
  borderRadius: '12px 12px 0 0',
  backgroundColor: 'background.content.dark',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const titleCss = css({
  padding: '16px',
});

const contentCss = css({
  textStyle: 'h3',
  margin: '0',
});
