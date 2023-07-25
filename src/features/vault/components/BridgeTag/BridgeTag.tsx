import { makeStyles } from '@material-ui/core';
import type { MouseEventHandler, ReactNode } from 'react';
import { forwardRef, memo, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { styles } from './styles';
import type { BridgeEntity } from '../../../data/entities/bridge';
import clsx from 'clsx';
import type { TooltipProps } from '../../../../components/Tooltip';
import { Tooltip, TRIGGERS } from '../../../../components/Tooltip';
import { getBridgeIcon } from '../../../../helpers/bridgeProviderSrc';
import type { ChainEntity } from '../../../data/entities/chain';
import { getNetworkSrc } from '../../../../helpers/networkSrc';

const useStyles = makeStyles(styles);

export type NativeTagProps = {
  chain: ChainEntity;
};

export const NativeTag = memo<NativeTagProps>(function NativeTag({ chain }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const icon = getNetworkSrc(chain.id);

  return (
    <TagWithTooltip content={<NativeTooltip chain={chain} />} group="asset-details">
      {icon ? <img src={icon} alt={chain.name} className={classes.icon} width={24} /> : null}
      {t('TokenBridge-native')}
    </TagWithTooltip>
  );
});

export type BridgeTagProps = {
  bridge: BridgeEntity;
  chain: ChainEntity;
};
export const BridgeTag = memo<BridgeTagProps>(function BridgeTag({ bridge, chain }) {
  const classes = useStyles();
  const icon = getBridgeIcon(bridge.id);

  return (
    <TagWithTooltip content={<BridgeTooltip bridge={bridge} chain={chain} />} group="asset-details">
      {icon ? <img src={icon} alt={bridge.name} className={classes.icon} width={24} /> : null}
      {bridge.tagName}
    </TagWithTooltip>
  );
});

export type NativeTooltipProps = {
  chain: ChainEntity;
};
const NativeTooltip = memo<NativeTooltipProps>(function NativeTooltip({ chain }) {
  const { t } = useTranslation();
  return <TagTooltip content={t('TokenBridge-Tooltip-native', { chain: chain.name })} />;
});

export type BridgeTooltipProps = {
  bridge: BridgeEntity;
  chain: ChainEntity;
};
const BridgeTooltip = memo<BridgeTooltipProps>(function BridgeTooltip({ bridge, chain }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(e => {
    e.stopPropagation(); // allow link to open (stop event being cancelled in tooltip)
  }, []);

  return (
    <TagTooltip
      content={
        <Trans
          t={t}
          i18nKey={'TokenBridge-Tooltip-bridge'}
          values={{ chain: chain.name, bridge: bridge.name }}
          components={{
            website: (
              <a
                href={bridge.website}
                className={classes.link}
                target={'_blank'}
                rel={'noopener'}
                onClick={onClick}
              />
            ),
          }}
        />
      }
    />
  );
});

export type TagTooltipProps = {
  content: ReactNode;
};
const TagTooltip = memo<TagTooltipProps>(function BridgeTooltip({ content }) {
  const classes = useStyles();
  return <div className={classes.tooltip}>{content}</div>;
});

type TagWithTooltipProps = {
  className?: string;
  children: ReactNode;
} & TooltipProps;

const TagWithTooltip = memo(
  forwardRef<HTMLDivElement, TagWithTooltipProps>(function TagWithTooltip(
    { children, className, triggerClass, ...rest },
    ref
  ) {
    const classes = useStyles();
    return (
      <Tooltip
        placement="top"
        triggerClass={clsx(classes.tag, className, triggerClass)}
        triggers={TRIGGERS.CLICK}
        ref={ref}
        {...rest}
      >
        {children}
      </Tooltip>
    );
  })
);
